import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import { ProductInput } from "../libs/types/product";
import { AdminRequest } from "../libs/types/user";
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

    const data: ProductInput = {
      ...req.body,
      sellerId: shapeIntoMongooseObjectId(req.user._id),
      productImages: req.files.map((file) =>
        `/${file.path.replace(/\\/g, "/").replace(/^\.?\//, "")}`,
      ),
    };

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
