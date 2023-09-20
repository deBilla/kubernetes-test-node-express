import { Types } from "mongoose";
import { IProduct } from "../models/Product";
import { ProductRepository } from "../repositories/ProductRepository";
import * as amqp from "amqplib";

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

  consumeCartEvent = async () => {
    const connection = await amqp.connect(`amqp://${process.env.rabbitMQHost}`);
    const channel = await connection.createChannel();

    const exchangeName = "cart_exchange";

    await channel.assertExchange(exchangeName, "fanout", { durable: false });

    const queue = await channel.assertQueue("", { exclusive: true });
    await channel.bindQueue(queue.queue, exchangeName, "");

    channel.consume(
      queue.queue,
      (message) => {
        console.log(
          `Received: ${message ? message.content.toString() : "err"}`
        );
      },
      { noAck: true }
    );
  };
}
