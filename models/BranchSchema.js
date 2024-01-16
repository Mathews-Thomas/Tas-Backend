import mongoose from "mongoose";
const { Schema } = mongoose;
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";
const locationSchema = new Schema(
  {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  { _id: false }
);



const contactSchema = new Schema(
  {
    phone: String,
    email: String,
  },
  { _id: false }
);



const securityCredentialsSchema = new Schema(
  {
    loginId: { type: String, lowercase: true },
    password: String,
  },
  { _id: false }
);

const branchSchema = new Schema({
  branchName: String,
  location: locationSchema,
  contact: contactSchema,
  securityCredentials: securityCredentialsSchema,
  createdAt: { type: Date, default: Date.now },
});
await addCreatedAtIST(branchSchema)
const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
