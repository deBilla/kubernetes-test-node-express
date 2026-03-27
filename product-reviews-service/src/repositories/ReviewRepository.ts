import { Types } from "mongoose";
import Review, { IReview } from "../models/Review";

export class ReviewRepository {
  constructor() {}

  save = async (newReview: IReview) => {
    const review = new Review(newReview);
    const saveResult = await review.save();
    return saveResult;
  };

  viewAll = async (tenantId: string) => {
    return await Review.find({ tenantId });
  };

  viewById = async (id: Types.ObjectId, tenantId: string) => {
    return await Review.findOne({ _id: id, tenantId });
  };

  viewByProductId = async (productId: string, tenantId: string) => {
    return await Review.find({ productId, tenantId });
  };
}
