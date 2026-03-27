import { Types } from "mongoose";
import Customer, { ICustomer } from "../models/Customer";

export class CustomerRepository {
  constructor() {}

  save = async (newCustomer: ICustomer) => {
    const customer = new Customer(newCustomer);
    const saveResult = await customer.save();
    return saveResult;
  };

  viewAll = async (tenantId: string) => {
    return await Customer.find({ tenantId });
  };

  viewById = async (id: Types.ObjectId, tenantId: string) => {
    return await Customer.findOne({ _id: id, tenantId });
  };
}
