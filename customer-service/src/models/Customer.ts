import { Schema, model } from "mongoose";

export interface ICustomer {
  tenantId: string;
  name: string;
}

const customerSchema = new Schema<ICustomer>({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
});

const Customer = model<ICustomer>("Customer", customerSchema);

export default Customer;
