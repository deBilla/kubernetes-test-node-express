import { Schema, model } from "mongoose";

export interface IOrder {
  tenantId: string;
  cart: any;
  customerId: string;
  total: number;
}

const orderSchema = new Schema<IOrder>({
  tenantId: { type: String, required: true },
  cart: [],
  customerId: { type: String },
  total: { type: Number },
});

const Order = model<IOrder>("Order", orderSchema);

export default Order;