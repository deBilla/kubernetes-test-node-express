import { Schema, model } from "mongoose";

export interface IOrder {
  cart: any;
  customerId: string;
  total: number;
}

const orderSchema = new Schema<IOrder>({
  cart: [],
  customerId: { type: String },
  total: { type: Number },
});

const Order = model<IOrder>("Order", orderSchema);

export default Order;