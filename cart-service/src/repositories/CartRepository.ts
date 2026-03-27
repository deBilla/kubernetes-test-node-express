import { Types } from "mongoose";
import Cart, { ICart, IItem } from "../models/Cart";

export class CartRepository {
  constructor() {}

  save = async (newCart: ICart) => {
    const cart = new Cart(newCart);
    const saveResult = await cart.save();
    return saveResult;
  };

  addItem = async (cartId: Types.ObjectId, tenantId: string, item: IItem) => {
    return await Cart.findOneAndUpdate(
      { _id: cartId, tenantId },
      { $push: { items: item } },
      { new: true }
    );
  };

  viewAll = async (tenantId: string) => {
    return await Cart.find({ tenantId });
  };

  viewById = async (id: Types.ObjectId, tenantId: string) => {
    return await Cart.findOne({ _id: id, tenantId });
  };
}
