import express, { Request, Response } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { IReview } from "../models/Review";
import { Types } from "mongoose";

const reviewRouter = express.Router();
const reviewController = new ReviewController();

reviewRouter.post(
  "/",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = (req as any).tenantId;
      const review: IReview = { ...req.body, tenantId };
      const savedReview = await reviewController.saveReview(review);
      return res.status(201).json(savedReview);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

reviewRouter.get(
  "/product/:productId",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = (req as any).tenantId;
      const productId = req.params.productId;
      const reviews = await reviewController.viewReviewsByProductId(productId, tenantId);
      return res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

reviewRouter.get(
  "/:reviewId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = (req as any).tenantId;
      const reviewId = req.params.reviewId;
      if (reviewId) {
        const id = new Types.ObjectId(reviewId);
        const review = await reviewController.viewReviewById(id, tenantId);
        return res.status(200).json(review);
      } else {
        const allReviews = await reviewController.viewAllReviews(tenantId);
        return res.status(200).json(allReviews);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default reviewRouter;
