import { Types } from "mongoose";
import Product, { IItem, IProduct } from "../models/Product";
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
        try {
          this.processCartChange(item);
        } catch(e) {
          console.error(e);
        }
        
        console.log(
          `Received: ${message.content.toString()}`
        );
      },
      { noAck: true }
    );
  };

  private processCartChange = async (item: IItem) => {
    const id = new Types.ObjectId(item.productId);
    const product = await this.viewProductById(id);
    const stock = product?.stock;

    if (!stock) throw new Error('No product stock found !!!');

    const remainingStock = stock - item.quantity;

    if (remainingStock < 0) throw new Error('Stock is not sufficient !!!');
    await this.repo.updateProductStock(id, remainingStock);

    console.log('successfully updated the product !!!');
  }
}
