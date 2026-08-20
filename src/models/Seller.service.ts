import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { UserType } from "../libs/enums/user.enum";
import { SellerStatus } from "../libs/enums/seller.enum";
import { Seller, SellerInput, SellerLoginInput, SellerProfileUpdateInput, SellerUpdateInput } from "../libs/types/seller";
import SellerModel from "../schema/Seller.model";
import ProductModel from "../schema/Product.model";
import * as bcrypt from "bcryptjs";
import { ProductStatus } from "../libs/enums/product.enum";

export type PublicSellerStudio = {
    id: string;
    nick: string;
    address: string;
    description: string;
    image: string;
    productCount: number;
    rating: number;
};

class SellerService {
    private readonly sellerModel;

    constructor() {
        this.sellerModel = SellerModel;
    }

    public async signup(input: SellerInput): Promise<Seller> {
        const salt = await bcrypt.genSalt();
        input.sellerPassword = await bcrypt.hash(input.sellerPassword, salt);

        try{
            const result = await this.sellerModel.create(input);
            result.sellerPassword= "";
            return result.toJSON();
        } catch(err) {
            console.error("Error, sellersignup", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }
    }

    public async login(input: SellerLoginInput): Promise<Seller> {
        const seller = await this.sellerModel
            .findOne(
                {
                    sellerNick: input.sellerNick,
                    sellerStatus: {$ne: SellerStatus.DELETED},
                },
                {
                    sellerNick: 1,
                    sellerPassword: 1,
                    sellerStatus: 1,
                })
            .exec();
        if (!seller) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK);
        }

        if(seller.sellerStatus === SellerStatus.BLOCKED) {
            throw new Errors(HttpCode.FORBIDDED, Message.BLOCKED_USER);
        }

        const isMatch = await bcrypt.compare(input.sellerPassword, seller.sellerPassword);

        if(!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        // @ts-ignore
        return await this.sellerModel.findById(seller._id).lean().exec();
    }

    public async getSellers(): Promise<Seller[]> {
        const result = await this.sellerModel
            .find({userType: UserType.SELLER})
            .exec();
            console.log("result:", result);
            if(!result)
                throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

            return result;
    }

    public async getPublicSellers(): Promise<PublicSellerStudio[]> {
        const sellers = await this.sellerModel
            .find({ sellerStatus: SellerStatus.ACTIVE })
            .select("sellerNick sellerAddress sellerDesc sellerImage")
            .lean()
            .exec();

        const productStats = await ProductModel.aggregate([
            { $match: { productStatus: ProductStatus.ACTIVE } },
            {
                $group: {
                    _id: "$sellerId",
                    productCount: { $sum: 1 },
                    rating: { $avg: "$productRating" },
                },
            },
        ]).exec();

        const statsBySellerId = new Map(
            productStats.map((stat) => [String(stat._id), stat]),
        );

        return sellers
            .map((seller) => {
                const stats = statsBySellerId.get(String(seller._id));
                return {
                    id: String(seller._id),
                    nick: seller.sellerNick || "",
                    address: seller.sellerAddress || "",
                    description: seller.sellerDesc || "",
                    image: seller.sellerImage || "",
                    productCount: stats?.productCount || 0,
                    rating: Number(stats?.rating || 0),
                };
            })
            .filter((seller) => seller.productCount > 0);
    }

    public async updateChosenSeller(input: SellerUpdateInput): Promise<Seller> {
        input._id = shapeIntoMongooseObjectId(input._id);
        const result = await this.sellerModel
        .findByIdAndUpdate({_id: input._id}, input, {new: true})
        .exec();

        if(!result)
            throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result;
    }

    public async getSellerProfile(sellerId: string): Promise<Seller> {
        const result = await this.sellerModel
            .findById(shapeIntoMongooseObjectId(sellerId))
            .select("-sellerPassword")
            .lean()
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result as Seller;
    }

    public async updateSellerProfile(sellerId: string, input: SellerProfileUpdateInput): Promise<Seller> {
        const update = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
        if (!Object.keys(update).length) throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
        const result = await this.sellerModel
            .findByIdAndUpdate(
                shapeIntoMongooseObjectId(sellerId),
                { $set: update },
                { new: true, runValidators: true },
            )
            .select("-sellerPassword")
            .lean()
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result as Seller;
    }


};

export default SellerService
