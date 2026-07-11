import { LoginInput, User, UserInput } from "../libs/types/user"
import UserModel from "../schema/User.model";
import Errors, { HttpCode, Message } from "../libs/Errors"
import { UserStatus, UserType } from "../libs/enums/user.enum"
import * as bcrypt from "bcryptjs";


class UserService {
    private readonly userModel;

    constructor() {
        this.userModel = UserModel;
    }

        /** SPA */

    public async signup(input: UserInput): Promise<User> {
        const salt = await bcrypt.genSalt();
        input.userPassword = await bcrypt.hash(input.userPassword, salt);

        try {
            const result = await this.userModel.create(input);
            result.userPassword = "";
            return result.toJSON();
        } catch(err) {
            console.error("ERROR, modelsignup", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }
    }


    public async login(input: LoginInput): Promise<User> {
        // TODO: Consider member status later
        const user = await this.userModel
            .findOne(
                {userNick: input.userNick},
                {userNick: 1, userPassword: 1})
            .exec();
        if (!user) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK);
        }

        const isMatch = await bcrypt.compare(input.userPassword, user.userPassword);

        if(!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        // @ts-ignore
        return await this.userModel.findById(user._id).lean().exec();
        

    }


    /** SSR */


    public async processSignup(input: UserInput): Promise<User> {
    
        const exist = await this.userModel
            .findOne({userType: UserType.ADMIN})
            .exec();
            console.log("exist:", exist);

        if(exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

        // Bu yerda kodni vijr vijr qilyapmiz
        const salt = await bcrypt.genSalt();
        input.userPassword = await bcrypt.hash(input.userPassword, salt);
        console.log("after", input.userPassword);

        try {
            const result = await this.userModel.create(input);
            result.userPassword = "";

            return result;
        } catch(err) {
             console.log("Real signup error:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async processLogin(input: LoginInput): Promise<User> {
        const user = await this.userModel
            .findOne(
                {userNick: input.userNick},
                {userNick: 1, userPassword: 1, userStatus: 1} 
            )
            .exec();
        if(!user) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK);
        }

        const isMatch = await bcrypt.compare(
            input.userPassword,
            user.userPassword
        );

        if(!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result =  await this.userModel.findById(user._id).exec();
        // @ts-ignore
        return result;
    }

    public async getUsers(): Promise<User[]> {
        const result = await this.userModel
            .find({userType: UserType.BUYER}, {userType: UserType.SELLER})
            .exec();

            if(!result)
                throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

            return result;
    }

}


export default UserService;
