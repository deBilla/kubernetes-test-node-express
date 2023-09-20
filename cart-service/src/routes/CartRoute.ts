import express, { Request, Response } from "express";
import { CartController } from "../controllers/CartController";
import { ICart } from "../models/Cart";
import { Types } from "mongoose";

const cartRouter = express.Router();
const cartController = new CartController();

cartRouter.post(
  "/",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const cart: ICart = req.body;
      console.log(req.body);
      const savedCart = await cartController.saveCart(cart);
      return res.status(201).json(savedCart);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

cartRouter.get(
  "/:productId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const productId = req.params.productId;
      if (productId) {
        const id = new Types.ObjectId(productId);
        const product = await cartController.viewCartById(id);
        return res.status(200).json(product);
      } else {
        const allProducts = await cartController.viewAllcarts();
        return res.status(200).json(allProducts);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

export default cartRouter;
