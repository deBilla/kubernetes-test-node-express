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
      const tenantId = (req as any).tenantId;
      const cart: ICart = { ...req.body, tenantId };
      const savedCart = await cartController.saveCart(cart);
      return res.status(201).json(savedCart);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

cartRouter.put(
  "/addItem/:cartId",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = (req as any).tenantId;
      const item: IItem = req.body;
      const cartId = req.params.cartId;
      const id = new Types.ObjectId(cartId);
      const savedCart = await cartController.addItemToCart(item, id, tenantId);
      return res.status(201).json(savedCart);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

cartRouter.get(
  "/:cartId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = (req as any).tenantId;
      const cartId = req.params.cartId;
      if (cartId) {
        const id = new Types.ObjectId(cartId);
        const cart = await cartController.viewCartById(id, tenantId);
        return res.status(200).json(cart);
      } else {
        const allCarts = await cartController.viewAllCarts(tenantId);
        return res.status(200).json(allCarts);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default cartRouter;
