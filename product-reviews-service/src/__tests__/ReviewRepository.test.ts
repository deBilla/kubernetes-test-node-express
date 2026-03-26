import { ReviewRepository } from "../repositories/ReviewRepository";
import Review from "../models/Review";
import { Types } from "mongoose";

jest.mock("../models/Review");

describe("ReviewRepository", () => {
  let repo: ReviewRepository;

  beforeEach(() => {
    repo = new ReviewRepository();
    jest.clearAllMocks();
  });

  describe("save", () => {
    it("should save a new review and return it", async () => {
      const reviewData = {
        productId: "prod123",
        customerId: "cust456",
        rating: 5,
        comment: "Great product!",
      };

      const mockSavedReview = { ...reviewData, _id: "review789" };
      (Review as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedReview),
      }));

      const result = await repo.save(reviewData);
      expect(result).toEqual(mockSavedReview);
    });
  });

  describe("viewAll", () => {
    it("should return all reviews", async () => {
      const mockReviews = [
        { productId: "prod1", rating: 5 },
        { productId: "prod2", rating: 3 },
      ];
      (Review.find as jest.Mock).mockResolvedValue(mockReviews);

      const result = await repo.viewAll();
      expect(Review.find).toHaveBeenCalled();
      expect(result).toEqual(mockReviews);
    });
  });

  describe("viewById", () => {
    it("should return a review by its ID", async () => {
      const mockReview = { productId: "prod1", rating: 4 };
      const id = new Types.ObjectId();
      (Review.findById as jest.Mock).mockResolvedValue(mockReview);

      const result = await repo.viewById(id);
      expect(Review.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockReview);
    });
  });

  describe("viewByProductId", () => {
    it("should return all reviews for a given product", async () => {
      const mockReviews = [
        { productId: "prod1", rating: 5 },
        { productId: "prod1", rating: 3 },
      ];
      (Review.find as jest.Mock).mockResolvedValue(mockReviews);

      const result = await repo.viewByProductId("prod1");
      expect(Review.find).toHaveBeenCalledWith({ productId: "prod1" });
      expect(result).toEqual(mockReviews);
    });
  });
});
