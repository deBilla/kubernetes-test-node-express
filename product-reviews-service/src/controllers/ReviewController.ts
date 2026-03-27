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

  viewAllReviews = async (tenantId: string) => {
    return await this.repo.viewAll(tenantId);
  };

  viewReviewById = async (id: Types.ObjectId, tenantId: string) => {
    return await this.repo.viewById(id, tenantId);
  };

  viewReviewsByProductId = async (productId: string, tenantId: string) => {
    return await this.repo.viewByProductId(productId, tenantId);
  };
}
