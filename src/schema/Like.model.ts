import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Products",
    },
  },
  { timestamps: true },
);

likeSchema.index({ buyerId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
