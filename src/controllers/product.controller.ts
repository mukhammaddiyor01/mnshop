import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common"
import ProductService from "../models/Product.service";
import { ProductInput } from "../libs/types/product";
import { AdminRequest } from "../libs/types/user";

const productService = new ProductService();

const productController: T = {};


/** SPA */


/** SSR */

productController.getAllProducts = async (req: Request, res: Response) => {
    try{
        console.log("getAllProducts");
        res.render("product");
    } catch(err) {
        console.log("ERROR, getAllProducts:", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.createNewProduct = async (req: AdminRequest, res: Response) => {
    try{
        console.log("createNewProduct");
        console.log("req.files:", req.files);

        if(!req.files?.length)
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
        
        const data: ProductInput = req.body;
        data.productImages = req.files?.map(ele => {
            return ele.path.replace(/\\/g, "/");
        });

        await productService.createNewProduct(data);

        res.send(
            `<script> alert("Successful Creation"); windows.location.replace('admin/product/all') </script>`
        );

    } catch(err) {
        console.log("createNewProduct", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
    try{
        console.log("updateChosenProduct");
    } catch(err) {
        console.log("updateChosenProduct", err)
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};


export default productController;