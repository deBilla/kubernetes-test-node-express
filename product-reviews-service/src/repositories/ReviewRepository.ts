import { Types } from "mongoose";
import Review, { IReview } from "../models/Review";

export class ReviewRepository {
  constructor() {}

  save = async (newReview: IReview) => {
    const review = new Review(newReview);
    const saveResult = await review.save();
    return saveResult;
  };

  viewAll = async () => {
    return await Review.find();
  };

  viewById = async (id: Types.ObjectId) => {
    return await Review.findById(id);
  };

  viewByProductId = async (productId: string) => {
    return await Review.find({ productId });
  };
}
