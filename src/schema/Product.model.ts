import mongoose, { Schema } from "mongoose";
import { ProductType, ProductStatus, ProductColors, ProductSizes, ProductVariants } from "../libs/enums/product.enum";

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

        productSlug: {
            type: String,
            required: true,
        },

        productDesc: {
            type: String,
        },

        productPrice: {
            type: Number,
            required: true,
        },

        productDiscountPrice: {
            type: Number,
            required: true,
        },

        productImages: {
            type: [String],
            default: [],
        },

        productColors: {
            type: String,
            enum: ProductColors,
            required: true,
        },

        productSizes: {
            type: String,
            enum: ProductSizes,
            default: ProductSizes.M,
        },

        productVariants: {
            type: [String],
            default: [],
        },

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

    { timestamps: true }
);

productSchema.index(
    {productName: 1, productSizes: 1, productColors: 1 },
    { unique: true }
);

export default mongoose.model("Products", productSchema);
