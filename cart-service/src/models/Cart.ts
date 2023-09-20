import { Schema, model } from "mongoose";

export interface ICart {
  uuid: string;
  items: IItem[];
}

export interface IItem {
  name: string;
  price: number;
  quantity: number;
  productId: string;
}

const cartSchema = new Schema<ICart>({
  items: [
    {
      uuid: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number },
      productId: { type: String },
    },
  ],
});

const Cart = model<ICart>("Cart", cartSchema);

export default Cart;
