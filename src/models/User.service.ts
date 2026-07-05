import { User, UserInput } from "../libs/types/user"
import UserModel from "../schema/User.model";
import Errors, { Httpcode, Message } from "../libs/Errors"
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

        if(exist) throw new Errors(Httpcode.BAD_REQUEST, Message.CREATE_FAILED);

        try {
            const tempResult = new this.userModel(input); // Call
            const result = await tempResult.save()

            result.userPassword = "";

            return result;
        } catch(err) {
            throw new Errors(Httpcode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

}


export default UserService;

