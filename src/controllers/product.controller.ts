import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { ProductInput } from "../libs/types/product";
import { AdminRequest } from "../libs/types/user";
import {
  ProductColors,
  ProductSizes,
  ProductStatus,
  ProductType,
} from "../libs/enums/product.enum";
import { promises as fs } from "fs";

const productService = new ProductService();

const productController: T = {};

const enumIncludes = <T extends string>(values: T[], value: string): value is T =>
  values.includes(value as T);

const parseEnumList = <T extends string>(value: unknown): string[] => {
  const rawValues = Array.isArray(value) ? value : [value];

  return [...new Set(
    rawValues
      .flatMap((item) => String(item ?? "").split(/[\s,]+/))
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean),
  )];
};

const parseBoolean = (value: unknown): boolean =>
  value === true || value === "true" || value === "on" || value === "1";

const removeUploadedFiles = async (files: Express.Multer.File[] = []) => {
  await Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => undefined)),
  );
};

/** SPA */

/** SSR */

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts();

    res.render("products", { products: data });
  } catch (err) {
    console.log("ERROR, getAllProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct");

    if (!req.files?.length)
      throw new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_IMAGE_REQUIRED);

    const productName = String(req.body.productName || "").trim();
    const productType = String(req.body.productType || ProductType.TSHIRT)
      .trim()
      .toUpperCase();
    const productStatus = String(req.body.productStatus || ProductStatus.PAUSE)
      .trim()
      .toUpperCase();
    const productColors = parseEnumList<ProductColors>(req.body.productColors);
    const productSizes = parseEnumList<ProductSizes>(
      req.body.productSizes || ProductSizes.M,
    );
    const productPrice = Number(req.body.productPrice);
    const productLeftCount = Number(req.body.productLeftCount);
    const productDiscountPrice =
      req.body.productDiscountPrice === "" ||
      req.body.productDiscountPrice === undefined
        ? undefined
        : Number(req.body.productDiscountPrice);

    const validProduct =
      productName.length > 0 &&
      enumIncludes(Object.values(ProductType), productType) &&
      enumIncludes(Object.values(ProductStatus), productStatus) &&
      productColors.length > 0 &&
      productColors.every((color) =>
        enumIncludes(Object.values(ProductColors), color),
      ) &&
      productSizes.length > 0 &&
      productSizes.every((size) =>
        enumIncludes(Object.values(ProductSizes), size),
      ) &&
      Number.isFinite(productPrice) &&
      productPrice > 0 &&
      Number.isInteger(productLeftCount) &&
      productLeftCount >= 0 &&
      (productDiscountPrice === undefined ||
        (Number.isFinite(productDiscountPrice) &&
          productDiscountPrice >= 0 &&
          productDiscountPrice <= productPrice));

    if (!validProduct)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PRODUCT_DATA);

    const data: ProductInput = {
      ...req.body,
      productName,
      productType,
      productStatus,
      productColors: productColors as ProductColors[],
      productSizes: productSizes as ProductSizes[],
      productPrice,
      productLeftCount,
      productDiscountPrice,
      productFeatured: parseBoolean(req.body.productFeatured),
      productSale: parseBoolean(req.body.productSale),
    };
    data.productImages = req.files.map((file) => {
      return `/${file.path.replace(/\\/g, "/").replace(/^\.?\//, "")}`;
    });

    await productService.createNewProduct(data);

    res.status(HttpCode.CREATED).send(
      `<script> alert("Successfully created"); window.location.replace("/product/all"); </script>`,
    );
  } catch (err) {
    console.log("ERROR, createNewProduct:", err);
    await removeUploadedFiles(req.files);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    const statusCode = err instanceof Errors ? err.code : HttpCode.INTERNAL_SERVER_ERROR;
    res.status(statusCode).send(
      `<script> alert("${message}"); window.location.replace("/product/all"); </script>`,
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;

    const result = await productService.updateChosenProduct(id, req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
