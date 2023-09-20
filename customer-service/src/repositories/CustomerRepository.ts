import { Types } from "mongoose";
import Customer, { ICustomer } from "../models/Customer";

export class CustomerRepository {
  constructor() {}

  save = async (newCustomer: ICustomer) => {
    const customer = new Customer(newCustomer);
    console.log('saving customer in the repository" ' + customer);
    const saveResult = await customer.save();
    return saveResult;
  };

  viewAll = async () => {
    return await Customer.find();
  };

  viewById = async (id: Types.ObjectId) => {
    return await Customer.findById(id);
  };
}
