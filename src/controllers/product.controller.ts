import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { ProductBulkStatusInput, ProductInput } from "../libs/types/product";
import { AdminRequest, ExtendedRequest } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import { promises as fs } from "fs";
import { shapeIntoMongooseObjectId } from "../libs/config";

const productService = new ProductService();

const productController: T = {};

const removeUploadedFiles = async (files: Express.Multer.File[] = []) => {
  await Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => undefined)),
  );
};

/** SPA */

productController.getPublicProducts = async (_req: Request, res: Response) => {
  try {
    const data = await productService.getPublicProducts();
    res.status(HttpCode.OK).json({ data });
  } catch (err) {
    console.log("ERROR, getPublicProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.registerProductView = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const data = await productService.registerProductView(req.user, req.params.id);
    return res.status(HttpCode.OK).json({ data });
  } catch (err) {
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** SSR */

productController.getAllProducts = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("getAllProducts");
    const sellerId =
      req.user?.userType === UserType.SELLER ? String(req.user._id) : undefined;
    const data = await productService.getAllProducts(sellerId);

    if (req.path.startsWith("/seller/")) {
      return res.status(HttpCode.OK).json({ data });
    }

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

    const data: ProductInput = {
      ...req.body,
      sellerId: shapeIntoMongooseObjectId(req.user._id),
      productImages: req.files.map(
        (file) => `/${file.path.replace(/\\/g, "/").replace(/^\.?\//, "")}`,
      ),
    };

    await productService.createNewProduct(data);

    res
      .status(HttpCode.CREATED)
      .send(
        `<script> alert("Successfully created"); window.location.replace("/product/all"); </script>`,
      );
  } catch (err) {
    console.log("ERROR, createNewProduct:", err);
    await removeUploadedFiles(req.files);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    const statusCode =
      err instanceof Errors ? err.code : HttpCode.INTERNAL_SERVER_ERROR;
    res
      .status(statusCode)
      .send(
        `<script> alert("${message}"); window.location.replace("/product/all"); </script>`,
      );
  }
};

productController.updateChosenProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id;

    const sellerId =
      req.user?.userType === UserType.SELLER ? String(req.user._id) : undefined;
    const result = await productService.updateChosenProduct(
      id,
      req.body,
      sellerId,
    );

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.updateBulkProductStatus = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("updateBulkProductStatus");

    const input: ProductBulkStatusInput = {
      productIds: req.body.productIds,
      productStatus: req.body.productStatus,
    };

    const sellerId =
      req.user?.userType === UserType.SELLER ? String(req.user._id) : undefined;
    const modifiedCount = await productService.updateBulkProductStatus(
      input,
      sellerId,
    );

    return res.status(HttpCode.OK).json({
      data: {
        modifiedCount,
      },
    });
  } catch (err) {
    console.log("Error, updateBulkProductStatus:", err);

    if (err instanceof Errors) {
      return res.status(err.code).json({
        message: err.message,
      });
    }

    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default productController;
