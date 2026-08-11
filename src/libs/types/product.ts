import { Types } from "mongoose";
import {
  ProductStatus,
  ProductType,
  ProductSizes,
  ProductColors,
} from "../enums/product.enum";

export interface Product {
  _id: Types.ObjectId;
  productStatus?: ProductStatus;
  productType: ProductType;
  productName: string;
  productDesc?: string;
  productPrice: number;
  productDiscountPrice?: number;
  productImages?: string[];
  productColors: ProductColors[];
  productSizes?: ProductSizes[];
  productVariants?: string[];
  productLeftCount: number;
  productSold?: number;
  productviews?: number;
  productRating?: number;
  productFeatured?: boolean;
  productSale?: boolean;
}

export interface ProductInput {
  productStatus?: ProductStatus;
  productType: ProductType;
  productName: string;
  productSlug?: string;
  productDesc?: string;
  productPrice: number;
  productDiscountPrice?: number;
  productImages?: string[];
  productColors: ProductColors[];
  productSizes?: ProductSizes[];
  productVariants?: string[];
  productLeftCount: number;
  productSold?: number;
  productviews?: number;
  productRating?: number;
  productFeatured?: boolean;
  productSale?: boolean;
}

export interface ProductUpdateInput {
  _id: Types.ObjectId;
  productStatus?: ProductStatus;
  productType: ProductType;
  productName: string;
  productSlug?: string;
  productDesc?: string;
  productPrice: number;
  productDiscountPrice?: number;
  productImages?: string[];
  productColors: ProductColors[];
  productSizes?: ProductSizes[];
  productVariants?: string[];
  productLeftCount: number;
  productSold?: number;
  productviews?: number;
  productRating?: number;
  productFeatured?: boolean;
  productSale?: boolean;
}
