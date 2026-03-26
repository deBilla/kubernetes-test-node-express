import { Types } from "mongoose";
import { IReview } from "../models/Review";
import { ReviewRepository } from "../repositories/ReviewRepository";

export class ReviewController {
  repo: ReviewRepository;
  constructor() {
    this.repo = new ReviewRepository();
  }

  saveReview = async (review: IReview) => {
    return await this.repo.save(review);
  };

  viewAllReviews = async () => {
    return await this.repo.viewAll();
  };

  viewReviewById = async (id: Types.ObjectId) => {
    return await this.repo.viewById(id);
  };

  viewReviewsByProductId = async (productId: string) => {
    return await this.repo.viewByProductId(productId);
  };
}
