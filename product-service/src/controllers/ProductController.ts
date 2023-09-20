import { Types } from "mongoose";
import { IProduct } from "../models/Product";
import { ProductRepository } from "../repositories/ProductRepository";

export class ProductController {
  repo: ProductRepository;
  constructor() {
    this.repo = new ProductRepository();
  }
  saveProduct = async (product: IProduct) => {
    return await this.repo.save(product);
  };

  viewAllProducts = async () => {
    return await this.repo.viewAll();
  };

  viewProductById = async (id: Types.ObjectId) => {
    return await this.repo.viewById(id);
  };
}
