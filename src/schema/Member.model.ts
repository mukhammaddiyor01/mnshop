import mongoose, {mongo, Schema} from "mongoose";
import { MemberStatus, MemberType } from '../libs/types/enums/member.enum';

const memberSchema = new Schema ({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.BUYER
    },

    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberNick: {
        type: String,
        index: {unique: true, sparse: true},
        required:true,
    },

    memberEmail: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },

    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },

    memberPassword: {
        type: String,
        select: false,
        required: true,
    },

    memberAddress: {
        type: String,
    },

    memberDesc: {
        type: String,
    },

    memberImage: {
        type: String,
    },

    memberPoints: {
        type: Number,
        default: 0,
    },

    memberFollowing: {
        type: Number,
    },

    memberFollowers: {
        type: Number,
    },

    memberLikes: {
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

export default mongoose.model("member", memberSchema);