import { Types } from "mongoose";
import Product, { IProduct } from "../models/Product";

export class ProductRepository {
  constructor() {}

  save = async (newProduct: IProduct) => {
    const product = new Product(newProduct);
    console.log('saving user in the repository" ' + product);
    const saveResult = await product.save();
    return saveResult;
  };

  viewAll = async () => {
    return await Product.find();
  };

  viewById = async (id: Types.ObjectId) => {
    return await Product.findById(id);
  };
}
