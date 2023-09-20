import express, { Request, Response } from "express";
import { OrderController } from "../controllers/OrderController";
import { IOrder } from "../models/Order";
import { Types } from "mongoose";

const orderRouter = express.Router();
const orderController = new OrderController();

orderRouter.post(
  "/",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const order: IOrder = req.body;
      console.log(req.body);
      const savedOrder = await orderController.saveOrder(order);
      return res.status(201).json(savedOrder);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

orderRouter.get(
  "/:orderId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const orderId = req.params.orderId;
      if (orderId) {
        const id = new Types.ObjectId(orderId);
        const order = await orderController.viewOrderById(id);
        return res.status(200).json(order);
      } else {
        const allOrders = await orderController.viewAllOrders();
        return res.status(200).json(allOrders);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

export default orderRouter;
