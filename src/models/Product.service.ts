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

  constructor() {
    this.productModel = ProductModel;
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
        discount === undefined || String(discount).trim() === ""
          ? undefined
          : Number(discount),
      productFeatured: parseBoolean(input.productFeatured),
      productSale: parseBoolean(input.productSale),
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
      (input.productDiscountPrice === undefined ||
        (Number.isFinite(input.productDiscountPrice) &&
          input.productDiscountPrice >= 0 &&
          input.productDiscountPrice <= input.productPrice));

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

      if (Object.keys(updateData).length === 0) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
      }

      const query = sellerId
        ? {
            _id: productId,
            sellerId: shapeIntoMongooseObjectId(sellerId),
          }
        : { _id: productId };

      const result = await this.productModel
        .findOneAndUpdate(
          query,
          {
            $set: updateData,
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
