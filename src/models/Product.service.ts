import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
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

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async getProductsByIds(productIds: string[]): Promise<Product[]> {
    try {
      const uniqueProductIds = [...new Set(productIds)];

      const ids = uniqueProductIds.map((id) => shapeIntoMongooseObjectId(id));

      const products = await this.productModel
        .find({
          _id: { $in: ids },
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
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findByIdAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    return result;
  }
}

export default ProductService;
