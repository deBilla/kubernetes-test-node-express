import { Schema, model } from "mongoose";

export interface IReview {
  tenantId: string;
  productId: string;
  customerId: string;
  rating: number;
  comment?: string;
}

const reviewSchema = new Schema<IReview>(
  {
    tenantId: { type: String, required: true },
    productId: { type: String, required: true },
    customerId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

const Review = model<IReview>("Review", reviewSchema);

export default Review;
