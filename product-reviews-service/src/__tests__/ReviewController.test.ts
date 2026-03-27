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
    it("should save a review with tenantId and return it", async () => {
      const reviewData = {
        tenantId: "tenant-a",
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
        controller.saveReview({ tenantId: "tenant-a", productId: "p1", customerId: "c1", rating: 3 })
      ).rejects.toThrow("DB connection failed");
    });
  });

  describe("viewAllReviews", () => {
    it("should return all reviews for a tenant", async () => {
      const mockReviews = [{ tenantId: "tenant-a", rating: 5 }, { tenantId: "tenant-a", rating: 3 }];
      mockViewAll.mockResolvedValue(mockReviews);

      const result = await controller.viewAllReviews("tenant-a");
      expect(mockViewAll).toHaveBeenCalledWith("tenant-a");
      expect(result).toEqual(mockReviews);
    });
  });

  describe("viewReviewById", () => {
    it("should return a review by ID and tenantId", async () => {
      const id = new Types.ObjectId();
      const mockReview = { tenantId: "tenant-a", productId: "prod1", rating: 4 };
      mockViewById.mockResolvedValue(mockReview);

      const result = await controller.viewReviewById(id, "tenant-a");
      expect(mockViewById).toHaveBeenCalledWith(id, "tenant-a");
      expect(result).toEqual(mockReview);
    });

    it("should return null when review not found for tenant", async () => {
      const id = new Types.ObjectId();
      mockViewById.mockResolvedValue(null);

      const result = await controller.viewReviewById(id, "tenant-b");
      expect(result).toBeNull();
    });
  });

  describe("viewReviewsByProductId", () => {
    it("should return all reviews for a product within a tenant", async () => {
      const mockReviews = [{ tenantId: "tenant-a", rating: 5 }, { tenantId: "tenant-a", rating: 2 }];
      mockViewByProductId.mockResolvedValue(mockReviews);

      const result = await controller.viewReviewsByProductId("prod123", "tenant-a");
      expect(mockViewByProductId).toHaveBeenCalledWith("prod123", "tenant-a");
      expect(result).toEqual(mockReviews);
    });

    it("should return empty array when product has no reviews for tenant", async () => {
      mockViewByProductId.mockResolvedValue([]);

      const result = await controller.viewReviewsByProductId("nonexistent", "tenant-b");
      expect(result).toEqual([]);
    });
  });
});
