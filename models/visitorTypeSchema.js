import mongoose from "mongoose";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";
 
const visitorTypeSchema = new mongoose.Schema({ 
  type: { type: String, trim: true, required: true },
  description: { type: String, required: false, trim: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true, trim: true },
  status:{type:Boolean,default:false},
  isApproved:{type:Boolean,default:false},
});

await addCreatedAtIST(visitorTypeSchema)

const VisitorType = mongoose.model("VisitorType", visitorTypeSchema);
export default VisitorType;
