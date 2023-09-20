import { Types } from "mongoose";
import Cart, { ICart } from "../models/Cart";
import { CartRepository } from "../repositories/CartRepository";

export class CartController {
  repo: CartRepository;
  constructor() {
    this.repo = new CartRepository();
  }
  saveCart = async (cart: ICart) => {
    return await this.repo.save(cart);
  };

  viewAllcarts = async () => {
    return await this.repo.viewAll();
  };

  viewCartById = async (id: Types.ObjectId) => {
    return await this.repo.viewById(id);
  };
}
