import Product, { IProduct } from "../models/Product";
import { ProductRepository } from "../repositories/ProductRepository";

export class ProductController {
    repo: ProductRepository;
    constructor () {
        this.repo = new ProductRepository();
    }
    saveProduct = async (newProduct: IProduct) => {
        const product = new Product(newProduct);
        const res = await this.repo.save(product);
        return res;
    }
}