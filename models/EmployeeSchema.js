import mongoose from "mongoose";
import Role from "./RoleSchema.js";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const { Schema } = mongoose;

const employeeSchema = new Schema({
  securityCredentials: { 
    loginId: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  firstName: String,
  lastName: String,
  email: { type: String, required: true },
  phone: String,
  designation: String, 
  role: { type: mongoose.Schema.Types.ObjectId, ref: Role },
  status: Boolean,
  createdAt: { type: Date, default: Date.now },
  isApproved:{type:Boolean,default:false},
});
await addCreatedAtIST(employeeSchema)

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
