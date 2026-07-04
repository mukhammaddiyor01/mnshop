import mongoose, {mongo, Schema} from "mongoose";
import { UserType, UserStatus } from "../libs/types/enums/user.enum";


const userSchema = new Schema ({
    userType: {
        type: String,
        enum: UserType,
        default: UserType.BUYER
    },

    userStatus: {
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE
    },

    userNick: {
        type: String,
        index: {unique: true, sparse: true},
        required:true,
    },

    userEmail: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },

    userPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },

    userPassword: {
        type: String,
        select: false,
        required: true,
    },

    userAddress: {
        type: String,
    },

    muserDesc: {
        type: String,
    },

    userImage: {
        type: String,
    },

    userPoints: {
        type: Number,
        default: 0,
    },

    userFollowing: {
        type: Number,
    },

    userFollowers: {
        type: Number,
    },

    userLikes: {
        type: Number,
        default: 0,
    },

    myProducts: {
        type: String,
    },

    myOrders: {
        type: String,
    },

},
    {timestamps: true}    // updatedAt, createdAt
);

export default mongoose.model("member", userSchema);