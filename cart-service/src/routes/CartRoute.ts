import express, { Request, Response } from "express";
import { CartController } from "../controllers/CartController";
import { ICart, IItem } from "../models/Cart";
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

cartRouter.put(
  "/addItem/:cartId",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const item: IItem = req.body;
      const cartId = req.params.cartId;
      const id = new Types.ObjectId(cartId);
      console.log(req.body);
      const savedCart = await cartController.addItemToCart(item, id);
      return res.status(201).json(savedCart);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

cartRouter.get(
  "/:cartId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const cartId = req.params.cartId;

      if (cartId) {
        const id = new Types.ObjectId(cartId);
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
