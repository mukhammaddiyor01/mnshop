import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductBulkStatusInput,
  ProductInput,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import {
  ProductColors,
  ProductSizes,
  ProductStatus,
  ProductType,
} from "../libs/enums/product.enum";
import { User } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";

const enumIncludes = <T extends string>(
  values: T[],
  value: string,
): value is T => values.includes(value as T);

const parseEnumList = <T extends string>(value: unknown): T[] => {
  const rawValues = Array.isArray(value) ? value : [value];

  return [
    ...new Set(
      rawValues
        .flatMap((item) => String(item ?? "").split(/[\s,]+/))
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean),
    ),
  ] as T[];
};

const parseBoolean = (value: unknown): boolean =>
  value === true || value === "true" || value === "on" || value === "1";

class ProductService {
  private readonly productModel;
  private readonly viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /** SPA */

  /** SSR */

  public async getAllProducts(sellerId?: string): Promise<Product[]> {
    try {
      const query = sellerId
        ? { sellerId: shapeIntoMongooseObjectId(sellerId) }
        : {};

      const result = await this.productModel
        .find(query)
        .sort({
          createdAt: -1,
        })
        .exec();

      return result;
    } catch (err) {
      console.log("Error, ProductService.getAllProducts:", err);

      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  public async getPublicProducts(): Promise<Product[]> {
    try {
      return await this.productModel
        .find({
          productStatus: ProductStatus.ACTIVE,
          productLeftCount: { $gt: 0 },
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (err) {
      console.log("Error, ProductService.getPublicProducts:", err);
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG,
      );
    }
  }

  public async registerProductView(buyer: User, productId: string): Promise<Product> {
    try {
      if (buyer.userType !== UserType.BUYER) {
        throw new Errors(HttpCode.FORBIDDED, Message.BUYER_ACCOUNT_REQUIRED);
      }

      const targetProductId = shapeIntoMongooseObjectId(productId);
      const product = await this.productModel.findById(targetProductId).exec();

      if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

      const isNewView = await this.viewService.createIfMissing({
        buyerId: shapeIntoMongooseObjectId(buyer._id),
        viewRefId: targetProductId,
        viewGroup: ViewGroup.PRODUCT,
      });

      if (!isNewView) return product as unknown as Product;

      return (await this.productModel
        .findByIdAndUpdate(
          targetProductId,
          { $inc: { productViews: 1 } },
          { new: true },
        )
        .exec()) as unknown as Product;
    } catch (err) {
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  public async getProductsByIds(productIds: string[]): Promise<Product[]> {
    try {
      const uniqueProductIds = [...new Set(productIds)];

      const ids = uniqueProductIds.map((id) => shapeIntoMongooseObjectId(id));

      const products = await this.productModel
        .find({
          _id: { $in: ids },
          productStatus: ProductStatus.ACTIVE,
          productLeftCount: { $gt: 0 },
        })
        .exec();

      if (products.length !== uniqueProductIds.length) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      return products;
    } catch (err) {
      console.log("Error, ProductService.getProductsByIds:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
    }
  }

  public async decreaseProductStock(
    input: Array<{ productId: string; itemQuantity: number }>,
  ): Promise<void> {
    const updatedItems: Array<{ productId: string; itemQuantity: number }> = [];

    try {
      for (const item of input) {
        const productId = shapeIntoMongooseObjectId(item.productId);
        const result = await this.productModel
          .findOneAndUpdate(
            {
              _id: productId,
              productStatus: ProductStatus.ACTIVE,
              productLeftCount: { $gte: item.itemQuantity },
            },
            {
              $inc: {
                productLeftCount: -item.itemQuantity,
                productSold: item.itemQuantity,
              },
            },
            { new: true },
          )
          .exec();

        if (!result)
          throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

        updatedItems.push(item);
      }
    } catch (err) {
      await this.restoreProductStock(updatedItems);

      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  public async restoreProductStock(
    input: Array<{ productId: string; itemQuantity: number }>,
  ): Promise<void> {
    const promisedList = input.map(async (item) => {
      const productId = shapeIntoMongooseObjectId(item.productId);

      await this.productModel
        .findByIdAndUpdate(productId, {
          $inc: {
            productLeftCount: item.itemQuantity,
            productSold: -item.itemQuantity,
          },
        })
        .exec();
    });

    await Promise.all(promisedList);
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      const product = this.normalizeProductInput(input);
      this.validateProductInput(product);

      return await this.productModel.create(product);
    } catch (err) {
      console.error("Error, model:createNewProduct:", err);
      if (err instanceof Errors) throw err;
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private normalizeProductInput(input: ProductInput): ProductInput {
    const discount = input.productDiscountPrice;
    const productSale = parseBoolean(input.productSale);

    return {
      ...input,
      productName: String(input.productName || "").trim(),
      productType: String(input.productType || ProductType.TSHIRT)
        .trim()
        .toUpperCase() as ProductType,
      productStatus: String(input.productStatus || ProductStatus.PAUSE)
        .trim()
        .toUpperCase() as ProductStatus,
      productColors: parseEnumList<ProductColors>(input.productColors),
      productSizes: parseEnumList<ProductSizes>(
        input.productSizes || ProductSizes.M,
      ),
      productPrice: Number(input.productPrice),
      productLeftCount: Number(input.productLeftCount),
      productDiscountPrice:
        !productSale || discount === undefined || String(discount).trim() === ""
          ? undefined
          : Number(discount),
      productFeatured: parseBoolean(input.productFeatured),
      productSale,
    };
  }

  private validateProductInput(input: ProductInput): void {
    const validProduct =
      input.productName.length > 0 &&
      enumIncludes(Object.values(ProductType), input.productType) &&
      enumIncludes(Object.values(ProductStatus), input.productStatus || "") &&
      input.productColors.length > 0 &&
      input.productColors.every((color) =>
        enumIncludes(Object.values(ProductColors), color),
      ) &&
      Boolean(input.productSizes?.length) &&
      input.productSizes!.every((size) =>
        enumIncludes(Object.values(ProductSizes), size),
      ) &&
      Number.isFinite(input.productPrice) &&
      input.productPrice > 0 &&
      Number.isInteger(input.productLeftCount) &&
      input.productLeftCount >= 0 &&
      (!input.productSale ||
        (input.productDiscountPrice !== undefined &&
          Number.isFinite(input.productDiscountPrice) &&
          input.productDiscountPrice > 0 &&
          input.productDiscountPrice < input.productPrice));

    if (!validProduct)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_DATA);
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput,
    sellerId?: string,
  ): Promise<Product> {
    try {
      const productId = shapeIntoMongooseObjectId(id);

      const query = sellerId
        ? {
            _id: productId,
            sellerId: shapeIntoMongooseObjectId(sellerId),
          }
        : { _id: productId };

      const existingProduct = await this.productModel.findOne(query).exec();
      if (!existingProduct) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      const updateData: ProductUpdateInput = {};

      if (input.productStatus !== undefined) {
        if (!Object.values(ProductStatus).includes(input.productStatus)) {
          throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_DATA);
        }

        updateData.productStatus = input.productStatus;
      }

      if (input.productFeatured !== undefined) {
        updateData.productFeatured = parseBoolean(input.productFeatured);
      }

      if (input.productName !== undefined) {
        updateData.productName = String(input.productName).trim();
      }

      if (input.productPrice !== undefined) {
        updateData.productPrice = Number(input.productPrice);
      }

      if (input.productDiscountPrice !== undefined) {
        updateData.productDiscountPrice = Number(input.productDiscountPrice);
      }

      if (input.productLeftCount !== undefined) {
        updateData.productLeftCount = Number(input.productLeftCount);
      }

      if (input.productDesc !== undefined) {
        updateData.productDesc = String(input.productDesc).trim();
      }

      if (input.productType !== undefined) {
        updateData.productType = input.productType;
      }

      if (input.productColors !== undefined) {
        updateData.productColors = input.productColors;
      }

      if (input.productSizes !== undefined) {
        updateData.productSizes = input.productSizes;
      }

      if (input.productSale !== undefined) {
        updateData.productSale = parseBoolean(input.productSale);
      }

      const nextProductPrice =
        updateData.productPrice ?? existingProduct.productPrice;
      const nextProductSale =
        updateData.productSale ?? Boolean(existingProduct.productSale);
      const nextDiscountPrice =
        input.productDiscountPrice !== undefined
          ? Number(input.productDiscountPrice)
          : existingProduct.productDiscountPrice;

      if (nextProductSale) {
        if (
          !Number.isFinite(nextProductPrice) ||
          nextProductPrice <= 0 ||
          !Number.isFinite(nextDiscountPrice) ||
          !nextDiscountPrice ||
          nextDiscountPrice <= 0 ||
          nextDiscountPrice >= nextProductPrice
        ) {
          throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_DATA);
        }
        updateData.productDiscountPrice = nextDiscountPrice;
      } else {
        delete updateData.productDiscountPrice;
      }

      if (Object.keys(updateData).length === 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      const result = await this.productModel
        .findOneAndUpdate(
          query,
          {
            $set: updateData,
            ...(nextProductSale ? {} : { $unset: { productDiscountPrice: 1 } }),
          },
          {
            new: true,
            runValidators: true,
          },
        )
        .exec();

      if (!result) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      return result;
    } catch (err) {
      console.log("Error, ProductService.updateChosenProduct:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }

  public async updateBulkProductStatus(
    input: ProductBulkStatusInput,
    sellerId?: string,
  ): Promise<number> {
    try {
      if (!Array.isArray(input.productIds) || input.productIds.length === 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      if (!Object.values(ProductStatus).includes(input.productStatus)) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_DATA);
      }

      const uniqueProductIds = [...new Set(input.productIds)];

      const productIds = uniqueProductIds.map((id) =>
        shapeIntoMongooseObjectId(id),
      );

      const query = sellerId
        ? {
            _id: { $in: productIds },
            sellerId: shapeIntoMongooseObjectId(sellerId),
          }
        : { _id: { $in: productIds } };

      const result = await this.productModel.updateMany(
        query,
        {
          $set: {
            productStatus: input.productStatus,
          },
        },
        {
          runValidators: true,
        },
      );

      if (result.matchedCount !== productIds.length) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      return result.modifiedCount;
    } catch (err) {
      console.log("Error, ProductService.updateBulkProductStatus:", err);

      if (err instanceof Errors) {
        throw err;
      }

      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
    }
  }
}

export default ProductService;
