import { Schema, model } from "mongoose";

export interface ICart {
  uuid: string;
  items: IItem[];
}

export interface IItem {
  uuid: string;
  name: string;
  price: number;
  quantity: number;
}

const cartSchema = new Schema<ICart>({
  uuid: { type: String, required: true },
  items: [
    {
      uuid: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number },
    },
  ],
});

const Cart = model<ICart>("Cart", cartSchema);

export default Cart;
