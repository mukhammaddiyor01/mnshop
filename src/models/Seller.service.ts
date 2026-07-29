import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { UserType } from "../libs/enums/user.enum";
import { Seller, SellerInput, SellerLoginInput, SellerUpdateInput } from "../libs/types/seller";
import SellerModel from "../schema/Seller.model";
import * as bcrypt from "bcryptjs";

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
        // TODO: Consider member status later
        const seller = await this.sellerModel
            .findOne(
                {sellerNick: input.sellerNick},
                {sellerNick: 1, sellerPassword: 1})
            .exec();
        if (!seller) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK);
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

    public async updateChosenSeller(input: SellerUpdateInput): Promise<Seller> {
        input._id = shapeIntoMongooseObjectId(input._id);
        const result = await this.sellerModel
        .findByIdAndUpdate({_id: input._id}, input, {new: true})
        .exec();

        if(!result)
            throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result;
    }


};

export default SellerService