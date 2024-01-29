import mongoose from "mongoose";

import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";


const PaymentMethodSchema = new mongoose.Schema({ 
  Method: { type: String, trim: true, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true, trim: true },
  status:{type:Boolean,default:false},
  isApproved:{type:Boolean,default:false},
});
await addCreatedAtIST(PaymentMethodSchema)

 


const PaymentMethod = mongoose.model("PaymentMethod", PaymentMethodSchema);

export default PaymentMethod;

