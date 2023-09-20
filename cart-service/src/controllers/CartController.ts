import { Types } from "mongoose";
import { ICart } from "../models/Cart";
import { CartRepository } from "../repositories/CartRepository";
import * as amqp from "amqplib";

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

  publishCartCreatedEvent = async () => {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchangeName = "my_exchange";
    const message = "Hello, RabbitMQ!";

    await channel.assertExchange(exchangeName, "fanout", { durable: false });
    channel.publish(exchangeName, "", Buffer.from(message));

    console.log(`Sent: ${message}`);
    setTimeout(async () => {
      await connection.close();
      process.exit(0);
    }, 500);
  };

  receiveEvent = async () => {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchangeName = "my_exchange";

    await channel.assertExchange(exchangeName, "fanout", { durable: false });

    const queue = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue.queue, exchangeName, "");

    channel.consume(
      queue.queue,
      (message) => {
        console.log(`Received: ${message ? message.content.toString() : 'err'}`);
      },
      { noAck: true }
    );
  };
}
