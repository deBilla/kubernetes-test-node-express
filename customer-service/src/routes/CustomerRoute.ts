import express, { Request, Response } from "express";
import { CustomerController } from "../controllers/CustomerController";
import { ICustomer } from "../models/Customer";
import { Types } from "mongoose";

const customerRouter = express.Router();
const customerController = new CustomerController();

customerRouter.post(
  "/",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const customer: ICustomer = req.body;
      console.log(req.body);
      const savedProduct = await customerController.saveCustomer(customer);
      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

customerRouter.get(
  "/:customerId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const customerId = req.params.customerId;
      if (customerId) {
        const id = new Types.ObjectId(customerId);
        const product = await customerController.viewCustomerById(id);
        return res.status(200).json(product);
      } else {
        const allProducts = await customerController.viewAllCustomers();
        return res.status(200).json(allProducts);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
  }
);

export default customerRouter;
