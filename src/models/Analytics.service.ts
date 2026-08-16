import OrderModel from "../schema/Order.model";
import { AdminAnalytics } from "../libs/types/analytics";
import { PaymentStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";

class AnalyticsService {
  private readonly orderModel;

  constructor() {
    this.orderModel = OrderModel;
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
