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

  viewAllOrders = async (tenantId: string) => {
    return await this.repo.viewAll(tenantId);
  };

  viewOrderById = async (id: Types.ObjectId, tenantId: string) => {
    return await this.repo.viewById(id, tenantId);
  };
}
