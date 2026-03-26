import { ReviewController } from "../controllers/ReviewController";
import { ReviewRepository } from "../repositories/ReviewRepository";
import { Types } from "mongoose";

const mockSave = jest.fn();
const mockViewAll = jest.fn();
const mockViewById = jest.fn();
const mockViewByProductId = jest.fn();

jest.mock("../repositories/ReviewRepository", () => {
  return {
    ReviewRepository: jest.fn().mockImplementation(() => ({
      save: mockSave,
      viewAll: mockViewAll,
      viewById: mockViewById,
      viewByProductId: mockViewByProductId,
    })),
  };
});

describe("ReviewController", () => {
  let controller: ReviewController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ReviewController();
  });

  describe("saveReview", () => {
    it("should save a review and return it", async () => {
      const reviewData = {
        productId: "prod123",
        customerId: "cust456",
        rating: 5,
        comment: "Excellent!",
      };
      const mockSaved = { ...reviewData, _id: "review789" };
      mockSave.mockResolvedValue(mockSaved);

      const result = await controller.saveReview(reviewData);
      expect(mockSave).toHaveBeenCalledWith(reviewData);
      expect(result).toEqual(mockSaved);
    });

    it("should propagate error when save fails", async () => {
      mockSave.mockRejectedValue(new Error("DB connection failed"));

      await expect(
        controller.saveReview({ productId: "p1", customerId: "c1", rating: 3 })
      ).rejects.toThrow("DB connection failed");
    });
  });

  describe("viewAllReviews", () => {
    it("should return all reviews", async () => {
      const mockReviews = [{ rating: 5 }, { rating: 3 }];
      mockViewAll.mockResolvedValue(mockReviews);

      const result = await controller.viewAllReviews();
      expect(mockViewAll).toHaveBeenCalled();
      expect(result).toEqual(mockReviews);
    });
  });

  describe("viewReviewById", () => {
    it("should return a review by ID", async () => {
      const id = new Types.ObjectId();
      const mockReview = { productId: "prod1", rating: 4 };
      mockViewById.mockResolvedValue(mockReview);

      const result = await controller.viewReviewById(id);
      expect(mockViewById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockReview);
    });

    it("should return null when review not found", async () => {
      const id = new Types.ObjectId();
      mockViewById.mockResolvedValue(null);

      const result = await controller.viewReviewById(id);
      expect(result).toBeNull();
    });
  });

  describe("viewReviewsByProductId", () => {
    it("should return all reviews for a product", async () => {
      const mockReviews = [{ rating: 5 }, { rating: 2 }];
      mockViewByProductId.mockResolvedValue(mockReviews);

      const result = await controller.viewReviewsByProductId("prod123");
      expect(mockViewByProductId).toHaveBeenCalledWith("prod123");
      expect(result).toEqual(mockReviews);
    });

    it("should return empty array when product has no reviews", async () => {
      mockViewByProductId.mockResolvedValue([]);

      const result = await controller.viewReviewsByProductId("nonexistent");
      expect(result).toEqual([]);
    });
  });
});
