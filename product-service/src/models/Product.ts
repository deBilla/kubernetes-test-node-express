import { Schema, model } from "mongoose";

export interface IProduct {
  uuid: string;
  name: string;
  price: number;
  stock: number;
}

const productSchema = new Schema<IProduct>({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number },
});

const Product = model<IProduct>("Product", productSchema);

export default Product;
