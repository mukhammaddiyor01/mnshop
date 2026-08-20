import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { User } from "../libs/types/user";
import { UserType } from "../libs/enums/user.enum";
import LikeModel from "../schema/Like.model";
import ProductModel from "../schema/Product.model";
import UserModel from "../schema/User.model";

class LikeService {
  private readonly likeModel = LikeModel;
  private readonly productModel = ProductModel;
  private readonly userModel = UserModel;

  public async toggleLike(buyer: User, productId: string) {
    if (buyer.userType !== UserType.BUYER) {
      throw new Errors(HttpCode.FORBIDDED, Message.BUYER_ACCOUNT_REQUIRED);
    }

    const buyerId = shapeIntoMongooseObjectId(buyer._id);
    const targetProductId = shapeIntoMongooseObjectId(productId);
    const product = await this.productModel.findById(targetProductId).exec();

    if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const existingLike = await this.likeModel
      .findOneAndDelete({ buyerId, productId: targetProductId })
      .exec();
    const isLiked = !existingLike;

    if (isLiked) {
      await this.likeModel.create({ buyerId, productId: targetProductId });
    }

    const increment = isLiked ? 1 : -1;
    const [updatedProduct] = await Promise.all([
      this.productModel
        .findByIdAndUpdate(
          targetProductId,
          { $inc: { productLikes: increment } },
          { new: true },
        )
        .exec(),
      this.userModel
        .findByIdAndUpdate(buyerId, { $inc: { userLikes: increment } })
        .exec(),
    ]);

    return { isLiked, productLikes: updatedProduct?.productLikes || 0 };
  }

  public async getLikedProductIds(buyer: User): Promise<string[]> {
    if (buyer.userType !== UserType.BUYER) {
      throw new Errors(HttpCode.FORBIDDED, Message.BUYER_ACCOUNT_REQUIRED);
    }

    const likes = await this.likeModel
      .find({ buyerId: shapeIntoMongooseObjectId(buyer._id) })
      .select("productId")
      .exec();

    return likes.map((like) => String(like.productId));
  }
}

export default LikeService;
