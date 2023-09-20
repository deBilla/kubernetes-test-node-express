import { Types } from "mongoose";
import Cart, { ICart } from "../models/Cart";

export class CartRepository {
  constructor() {}

  save = async (newCart: ICart) => {
    const cart = new Cart(newCart);
    console.log('saving cart in the repository" ' + cart);
    const saveResult = await cart.save();
    return saveResult;
  };

  viewAll = async () => {
    return await Cart.find();
  };

  viewById = async (id: Types.ObjectId) => {
    return await Cart.findById(id);
  };
}
