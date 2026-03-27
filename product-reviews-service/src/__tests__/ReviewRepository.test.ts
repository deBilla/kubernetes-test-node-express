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
    it("should save a new review with tenantId and return it", async () => {
      const reviewData = {
        tenantId: "tenant-a",
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
    it("should return all reviews filtered by tenantId", async () => {
      const mockReviews = [
        { tenantId: "tenant-a", productId: "prod1", rating: 5 },
        { tenantId: "tenant-a", productId: "prod2", rating: 3 },
      ];
      (Review.find as jest.Mock).mockResolvedValue(mockReviews);

      const result = await repo.viewAll("tenant-a");
      expect(Review.find).toHaveBeenCalledWith({ tenantId: "tenant-a" });
      expect(result).toEqual(mockReviews);
    });
  });

  describe("viewById", () => {
    it("should return a review by its ID and tenantId", async () => {
      const mockReview = { tenantId: "tenant-a", productId: "prod1", rating: 4 };
      const id = new Types.ObjectId();
      (Review.findOne as jest.Mock).mockResolvedValue(mockReview);

      const result = await repo.viewById(id, "tenant-a");
      expect(Review.findOne).toHaveBeenCalledWith({ _id: id, tenantId: "tenant-a" });
      expect(result).toEqual(mockReview);
    });
  });

  describe("viewByProductId", () => {
    it("should return all reviews for a given product and tenant", async () => {
      const mockReviews = [
        { tenantId: "tenant-a", productId: "prod1", rating: 5 },
        { tenantId: "tenant-a", productId: "prod1", rating: 3 },
      ];
      (Review.find as jest.Mock).mockResolvedValue(mockReviews);

      const result = await repo.viewByProductId("prod1", "tenant-a");
      expect(Review.find).toHaveBeenCalledWith({ productId: "prod1", tenantId: "tenant-a" });
      expect(result).toEqual(mockReviews);
    });
  });
});
