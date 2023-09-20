import { Types } from "mongoose";
import { IOrder } from "../models/Order";
import { OrderRepository } from "../repositories/OrderRepository";

export class OrderController {
  repo: OrderRepository;
  constructor() {
    this.repo = new OrderRepository();
  }
  saveOrder = async (order: IOrder) => {
    return await this.repo.save(order);
  };

  viewAllOrders = async () => {
    return await this.repo.viewAll();
  };

  viewOrderById = async (id: Types.ObjectId) => {
    return await this.repo.viewById(id);
  };
}
