import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const MainDepartmentSchema  = new mongoose.Schema({
  Name: { type: String, required: true, trim: true, lowercase:true },
  departments:[{ type: mongoose.Schema.Types.ObjectId}],
  BranchID: { type: mongoose.Schema.Types.ObjectId, ref: Branch ,required:true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true, trim: true }, 
  status:{type:Boolean,default:false}, 
  isApproved:{type:Boolean,default:false},  
});
await addCreatedAtIST(MainDepartmentSchema )

const MainDepartment  = mongoose.model("MainDepartment", MainDepartmentSchema );
export default MainDepartment ;
