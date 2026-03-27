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

  viewAllCustomers = async (tenantId: string) => {
    return await this.repo.viewAll(tenantId);
  };

  viewCustomerById = async (id: Types.ObjectId, tenantId: string) => {
    return await this.repo.viewById(id, tenantId);
  };
}
