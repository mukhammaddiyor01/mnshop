import mongoose, { Schema } from "mongoose";
import {
  ProductType,
  ProductStatus,
  ProductColors,
  ProductSizes,
  ProductVariants,
} from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },

    productType: {
      type: String,
      enum: ProductType,
      default: ProductType.TSHIRT,
    },

    productName: {
      type: String,
      required: true,
    },

    // productSlug: {
    //   type: String,
    //   required: true,
    // },

    productDesc: {
      type: String,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    productDiscountPrice: {
      type: Number,
      required: false,
    },

    productImages: {
      type: [String],
      default: [],
    },

    productColors: {
      type: [{ type: String, enum: Object.values(ProductColors) }],
      required: true,
      validate: {
        validator: (values: string[]) => values.length > 0,
        message: "At least one product color is required",
      },
    },

    productSizes: {
      type: [{ type: String, enum: Object.values(ProductSizes) }],
      default: [ProductSizes.M],
      validate: {
        validator: (values: string[]) => values.length > 0,
        message: "At least one product size is required",
      },
    },

    // productVariants: {
    //   type: [String],
    //   default: [],
    // },

    productLeftCount: {
      type: Number,
      required: true,
    },

    productSold: {
      type: Number,
      default: 0,
    },

    productViews: {
      type: Number,
      default: 0,
    },

    productRating: {
      type: Number,
      default: 0,
    },

    productFeatured: {
      type: Boolean,
      default: false,
    },

    productSale: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

productSchema.index({ productName: 1 }, { unique: true });

export default mongoose.model("Products", productSchema);
