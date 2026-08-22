import OrderModel from "../schema/Order.model";
import { AdminAnalytics, SellerAnalytics, SellerOverview } from "../libs/types/analytics";
import { PaymentStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import ProductModel from "../schema/Product.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { ProductStatus } from "../libs/enums/product.enum";

class AnalyticsService {
  private readonly orderModel;
  private readonly productModel;

  constructor() {
    this.orderModel = OrderModel;
    this.productModel = ProductModel;
  }

  public async getSellerOverview(sellerId: string): Promise<SellerOverview> {
    const id = shapeIntoMongooseObjectId(sellerId);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [products, paidOrders, ordersToday, recentOrders] = await Promise.all([
      this.productModel.find({ sellerId: id }).select("productStatus productSold").lean(),
      this.orderModel.find({ sellerId: id, orderPaymentStatus: PaymentStatus.PAID }).select("orderTotal").lean(),
      this.orderModel.countDocuments({ sellerId: id, createdAt: { $gte: startOfToday } }),
      this.orderModel.find({ sellerId: id }).sort({ createdAt: -1 }).limit(4).lean(),
    ]);

    return {
      totalSales: products.reduce((sum, product) => sum + Number(product.productSold || 0), 0),
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.orderTotal || 0), 0),
      ordersToday,
      activeListings: products.filter((product) => product.productStatus === ProductStatus.ACTIVE).length,
      recentOrders,
    };
  }

  public async getSellerAnalytics(sellerId: string): Promise<SellerAnalytics> {
    const id = shapeIntoMongooseObjectId(sellerId);
    const [products, orders] = await Promise.all([
      this.productModel.find({ sellerId: id }).lean(),
      this.orderModel.find({ sellerId: id }).lean(),
    ]);
    const paidOrders = orders.filter((order) => order.orderPaymentStatus === PaymentStatus.PAID);
    const orderPipeline = orders.reduce<Record<string, number>>((result, order) => {
      const status = String(order.orderDeliveryStatus || "PENDING");
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {});

    return {
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.orderTotal || 0), 0),
      paidOrders: paidOrders.length,
      views: products.reduce((sum, product) => sum + Number(product.productViews || 0), 0),
      likes: products.reduce((sum, product) => sum + Number(product.productLikes || 0), 0),
      products: products.length,
      orderPipeline,
      topProducts: products
        .sort((a, b) => (Number(b.productSold) * 100 + Number(b.productViews) + Number(b.productLikes)) - (Number(a.productSold) * 100 + Number(a.productViews) + Number(a.productLikes)))
        .slice(0, 5)
        .map((product) => ({
          productId: String(product._id),
          productName: product.productName,
          sold: Number(product.productSold || 0),
          views: Number(product.productViews || 0),
          likes: Number(product.productLikes || 0),
          revenue: Number(product.productSold || 0) * Number(product.productPrice || 0),
        })),
    };
  }

  public async getAdminAnalytics(): Promise<AdminAnalytics> {
    try {
      const [revenueToday, revenueLast7Days, categoryPerformance, topProducts] =
        await Promise.all([
          this.getRevenueToday(),
          this.getRevenueLast7Days(),
          this.getCategoryPerformance(),
          this.getTopProducts(),
        ]);

      return {
        revenueToday,
        revenueLast7Days,
        categoryPerformance,
        topProducts,
      };
    } catch (err) {
      console.log("Error, AnalyticsService.getAdminAnalytics:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  private async getRevenueToday(): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          orderPaymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startOfToday },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$orderTotal" },
        },
      },
    ]);

    return Number(result[0]?.revenue || 0);
  }

  private async getRevenueLast7Days() {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          orderPaymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: {
            $sum: "$orderTotal",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    return result.map((item) => ({
      date: item._id,
      revenue: Number(item.revenue || 0),
    }));
  }

  private async getCategoryPerformance() {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          orderPaymentStatus: PaymentStatus.PAID,
        },
      },
      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "items",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$product.productType",
          sold: {
            $sum: "$items.itemQuantity",
          },
          revenue: {
            $sum: {
              $multiply: ["$items.itemPrice", "$items.itemQuantity"],
            },
          },
        },
      },
      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    const maxSold = Math.max(...result.map((item) => item.sold), 1);

    return result.map((item) => ({
      category: item._id,
      sold: item.sold,
      revenue: item.revenue,
      percentage: Math.round((item.sold / maxSold) * 100),
    }));
  }

  private async getTopProducts() {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          orderPaymentStatus: PaymentStatus.PAID,
        },
      },
      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "items",
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product._id",
          productName: { $first: "$product.productName" },
          sold: { $sum: "$items.itemQuantity" },
          revenue: {
            $sum: {
              $multiply: ["$items.itemPrice", "$items.itemQuantity"],
            },
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    return result.map((item) => ({
      productId: item._id.toString(),
      productName: item.productName,
      sold: item.sold,
      revenue: item.revenue,
    }));
  }
}

export default AnalyticsService;
