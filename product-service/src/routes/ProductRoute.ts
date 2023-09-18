import express, { Request, Response } from "express";
import { ProductController } from "../controllers/ProductController";
import { IProduct } from "../models/Product";
import { Types } from "mongoose";

const productRouter = express.Router();
const productController = new ProductController();

productRouter.post(
  "/",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const product: IProduct = req.body;
      console.log(req.body);
      const savedProduct = await productController.saveProduct(product);
      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

productRouter.get(
  "/:productId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const productId = req.params.productId;
      if (productId) {
        const id = new Types.ObjectId(productId);
        const product = await productController.viewProductById(id);
        return res.status(200).json(product);
      } else {
        const allProducts = await productController.viewAllProducts();
        return res.status(200).json(allProducts);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

export default productRouter;
