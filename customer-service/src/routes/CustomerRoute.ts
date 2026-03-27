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
      const tenantId = (req as any).tenantId;
      const customer: ICustomer = { ...req.body, tenantId };
      const savedCustomer = await customerController.saveCustomer(customer);
      return res.status(201).json(savedCustomer);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

customerRouter.get(
  "/:customerId?",
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = (req as any).tenantId;
      const customerId = req.params.customerId;
      if (customerId) {
        const id = new Types.ObjectId(customerId);
        const customer = await customerController.viewCustomerById(id, tenantId);
        return res.status(200).json(customer);
      } else {
        const allCustomers = await customerController.viewAllCustomers(tenantId);
        return res.status(200).json(allCustomers);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default customerRouter;
