import Errors, { HttpCode, Message } from "../libs/Errors";
import { Product, ProductInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { User } from "../libs/types/user";

class ProductService {
    private readonly productModel;

    constructor() {
        this.productModel = ProductModel;

    }

    /** SPA */

    /** SSR */


    public async createNewProduct(input: ProductInput): Promise<Product> {
        try{
            return await this.productModel.create(input);
        } catch(err) {
            console.error("Error, model:createNewPeoduct:", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

}

export default ProductService;