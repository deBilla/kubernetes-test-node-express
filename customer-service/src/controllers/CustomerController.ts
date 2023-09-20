import { Types } from "mongoose";
import { ICustomer } from "../models/Customer";
import { CustomerRepository } from "../repositories/CustomerRepository";

export class CustomerController {
  repo: CustomerRepository;
  constructor() {
    this.repo = new CustomerRepository();
  }
  saveCustomer = async (customer: ICustomer) => {
    return await this.repo.save(customer);
  };

  viewAllCustomers = async () => {
    return await this.repo.viewAll();
  };

  viewCustomerById = async (id: Types.ObjectId) => {
    return await this.repo.viewById(id);
  };
}
