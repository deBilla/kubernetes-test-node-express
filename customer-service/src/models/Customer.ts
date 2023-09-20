import { Schema, model } from "mongoose";

export interface ICustomer {
  name: string;
}

const customerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
});

const Customer = model<ICustomer>("Customer", customerSchema);

export default Customer;
