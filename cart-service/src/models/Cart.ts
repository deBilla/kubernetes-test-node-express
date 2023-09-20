import { Schema, model } from "mongoose";

export interface ICart {
  uuid: string;
  items: IProduct[];
}

export interface IProduct {
  uuid: string;
  name: string;
  price: number;
}

const cartSchema = new Schema<ICart>({
  uuid: { type: String, required: true },
  items: [
    {
      uuid: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
  ],
});

const Cart = model<ICart>("Cart", cartSchema);

export default Cart;
