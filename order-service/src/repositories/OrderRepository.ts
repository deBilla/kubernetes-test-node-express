import { Types } from "mongoose";
import Order, { IOrder } from "../models/Order";

export class OrderRepository {
  constructor() {}

  save = async (newOrder: IOrder) => {
    const order = new Order(newOrder);
    console.log('saving user in the repository" ' + order);
    const saveResult = await order.save();
    return saveResult;
  };

  viewAll = async () => {
    return await Order.find();
  };

  viewById = async (id: Types.ObjectId) => {
    return await Order.findById(id);
  };
}
