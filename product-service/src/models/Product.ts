import { Schema, model } from "mongoose";

export interface IProduct {
  tenantId: string;
  name: string;
  price: number;
  stock: number;
}

export interface IItem {
  name: string;
  price: number;
  quantity: number;
  productId: string;
}

const productSchema = new Schema<IProduct>({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number },
});

const Product = model<IProduct>("Product", productSchema);

export default Product;