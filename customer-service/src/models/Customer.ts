import { Schema, model } from "mongoose";

export interface ICustomer {
  uuid: string;
  name: string;
}

const customerSchema = new Schema<ICustomer>({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
});

const Customer = model<ICustomer>("Customer", customerSchema);

export default Customer;
