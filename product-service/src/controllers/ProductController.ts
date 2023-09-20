import { Types } from "mongoose";
import { IItem, IProduct } from "../models/Product";
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
      (message: any) => {
        if (!message) return;
        const item: IItem = JSON.parse(message.content);
        this.processCartChange(item);
        console.log(
          `Received: ${message.content.toString()}`
        );
      },
      { noAck: true }
    );
  };

  viewProductByUuid = async (uuid: string) => {
    return await this.repo.viewByUuid(uuid);
  };

  private processCartChange = async (item: IItem) => {
    const productArray = await this.viewProductByUuid(item.uuid);
    console.log(productArray);
  }
}
