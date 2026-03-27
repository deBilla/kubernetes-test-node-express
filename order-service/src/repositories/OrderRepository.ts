import { Types } from "mongoose";
import Order, { IOrder } from "../models/Order";

export class OrderRepository {
  constructor() {}

  save = async (newOrder: IOrder) => {
    const order = new Order(newOrder);
    const saveResult = await order.save();
    return saveResult;
  };

  viewAll = async (tenantId: string) => {
    return await Order.find({ tenantId });
  };

  viewById = async (id: Types.ObjectId, tenantId: string) => {
    return await Order.findOne({ _id: id, tenantId });
  };
}
