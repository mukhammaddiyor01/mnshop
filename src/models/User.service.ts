import { LoginInput, User, UserInput } from "../libs/types/user"
import UserModel from "../schema/User.model";
import Errors, { HttpCode, Message } from "../libs/Errors"
import { UserType } from "../libs/enums/user.enum"


class UserService {
    private readonly userModel;

    constructor() {
        this.userModel = UserModel;
    }

    public async processSignup(input: UserInput): Promise<User> {
    
        const exist = await this.userModel
            .findOne({userType: UserType.ADMIN})
            .exec();
            console.log("exist:", exist);

        if(exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);

        try {
            const tempResult = new this.userModel(input); // Call
            const result = await tempResult.save()

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
                {userNick: 1, userPassword: 1} 
            )
            .exec();
        if(!user) throw new Errors(HttpCode.NOT_FOUND, Message.NO_USER_NICK);
        
        const isMatch = input.userPassword === user.userPassword;

        if(!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        const result = await this.userModel.findById(user._id).exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result
    }

}


export default UserService;

