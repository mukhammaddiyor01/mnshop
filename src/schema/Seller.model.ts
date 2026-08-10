import mongoose, { Schema } from "mongoose";
import { SellerStatus } from "../libs/enums/seller.enum";
import { User } from "../libs/types/user";
import { Seller } from "../libs/types/seller";
import { UserType } from "../libs/enums/user.enum";

const sellerSchema = new Schema<Seller>(
  {
    userType: {
      type: String,
      enum: UserType,
      default: UserType.SELLER,
    },

    sellerStatus: {
      type: String,
      enum: SellerStatus,
      default: SellerStatus.ACTIVE,
    },

    sellerNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    sellerEmail: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    sellerPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },

    sellerPassword: {
      type: String,
      select: false,
      required: true,
    },

    sellerAddress: {
      type: String,
    },

    sellerDesc: {
      type: String,
    },

    sellerImage: {
      type: String,
    },

    sellerCommisionPercentage: {
      type: Number,
    },

    sellerLeftCount: {
      type: Number,
    },

    sellerTotalSales: {
      type: Number,
    },
  },
  { timestamps: true }, // updatedAt, createdAt
);

export default mongoose.model<Seller>("seller", sellerSchema);
