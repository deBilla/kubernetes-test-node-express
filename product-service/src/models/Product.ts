import { Schema, model } from "mongoose";

export interface IProduct {
  uuid: string;
  name: string;
  price: number;
}

const productSchema = new Schema<IProduct>({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  price: Number,
});

const Product = model<IProduct>("Product", productSchema);

export default Product;
