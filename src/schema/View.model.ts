import mongoose, { Schema } from "mongoose";
import { ViewGroup } from "../libs/enums/view.enum";

const viewSchema = new Schema(
  {
    viewGroup: {
      type: String,
      enum: Object.values(ViewGroup),
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    viewRefId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Products",
    },
  },
  { timestamps: true },
);

viewSchema.index({ buyerId: 1, viewRefId: 1, viewGroup: 1 }, { unique: true });

export default mongoose.model("View", viewSchema);
