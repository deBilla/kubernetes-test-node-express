import { Types } from "mongoose";
import { ICart, IItem } from "../models/Cart";
import { CartRepository } from "../repositories/CartRepository";
import * as amqp from "amqplib";

export class CartController {
  repo: CartRepository;
  constructor() {
    this.repo = new CartRepository();
  }

  saveCart = async (cart: ICart) => {
    const newCart = await this.repo.save(cart);
    return newCart;
  };

  addItemToCart = async (item: IItem, cartId: Types.ObjectId, tenantId: string) => {
    const updatedCart = await this.repo.addItem(cartId, tenantId, item);
    await this.publishCartCreatedEvent(item);
    return updatedCart;
  };

  viewAllCarts = async (tenantId: string) => {
    return await this.repo.viewAll(tenantId);
  };

  viewCartById = async (id: Types.ObjectId, tenantId: string) => {
    return await this.repo.viewById(id, tenantId);
  };

  publishCartCreatedEvent = async (item: IItem) => {
    try {
      const connection = await amqp.connect(
        `amqp://${process.env.rabbitMQHost}`
      );
      const channel = await connection.createChannel();

      const exchangeName = "cart_exchange";
      const message = JSON.stringify(item);

      await channel.assertExchange(exchangeName, "fanout", { durable: false });
      channel.publish(exchangeName, "", Buffer.from(message));

      console.log(`Sent: ${message}`);
      setTimeout(async () => {
        await connection.close();
      }, 500);
    } catch (e) {
      console.log(e);
    }
  };
}
