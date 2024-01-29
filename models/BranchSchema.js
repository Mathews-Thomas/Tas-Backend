import mongoose from "mongoose";
const { Schema } = mongoose;
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const securityCredentialsSchema = new Schema(
  {
    loginId: { type: String, lowercase: true },
    password: String,
  },
  { _id: false }
);

const branchSchema = new Schema({
  branchName: String,
  address: String,
  city: String,
  state: String,
  country: String,
  pincode: String,
  phone: String,
  email: String,
  createdBy:String,
  securityCredentials: securityCredentialsSchema,
  createdAt: { type: Date, default: Date.now },
  status:{type:Boolean,default:false},
  isApproved:{type:Boolean,default:false},
});
await addCreatedAtIST(branchSchema)
const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
