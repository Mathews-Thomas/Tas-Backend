import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const alertSchema = new mongoose.Schema({
  msg:{ type: String,required: true,},
  type:{type: String,enum: ["Info", "Warning", "Error","Success"],required: true,},
  createdBy: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  endDate: { type: Date, required: true,},
  startDate: { type: Date, required: true,},
  status: { type: Boolean, default: false },
  BranchID: { type: mongoose.Schema.Types.ObjectId, ref: Branch ,required:true },
});
await addCreatedAtIST(alertSchema) 
const Alert = mongoose.model("Alert", alertSchema);
export default Alert;

