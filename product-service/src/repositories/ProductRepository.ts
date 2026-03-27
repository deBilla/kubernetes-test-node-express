import { Types } from "mongoose";
import Product, { IProduct } from "../models/Product";

export class ProductRepository {
  constructor() {}

  save = async (newProduct: IProduct) => {
    const product = new Product(newProduct);
    const saveResult = await product.save();
    return saveResult;
  };

  viewAll = async (tenantId: string) => {
    return await Product.find({ tenantId });
  };

  viewById = async (id: Types.ObjectId, tenantId: string) => {
    return await Product.findOne({ _id: id, tenantId });
  };

  updateProductStock = async (id: Types.ObjectId, stock: number) => {
    return await Product.findByIdAndUpdate(id, { stock: stock });
  };
}
