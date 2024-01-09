import mongoose from "mongoose";
import Role from "./RoleSchema.js";

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
  position: String,
  department: String,
  role: { type: mongoose.Schema.Types.ObjectId, ref: Role },
  status: Boolean,
  createdAt: { type: String, required: true },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
