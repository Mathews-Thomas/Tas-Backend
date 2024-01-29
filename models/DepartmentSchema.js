import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const DepartmentSchema = new mongoose.Schema({
  Name: { type: String, required: true, trim: true, lowercase:true },
  BranchID: { type: mongoose.Schema.Types.ObjectId, ref: Branch ,required:true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true, trim: true },
  status:{type:Boolean,default:false},
  isApproved:{type:Boolean,default:false},
  
});
await addCreatedAtIST(DepartmentSchema)

const Department = mongoose.model("Department", DepartmentSchema);
export default Department;
