import mongoose from "mongoose";
import Role from "./RoleSchema.js";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const { Schema } = mongoose;

// Define the TaskSchema
const TaskSchema = new Schema({
  description: { type: String, required: true },
  createdAt: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ["pending", "in progress", "completed"],
  },
});

const employeeSchema = new Schema({
  securityCredentials: {
    loginId: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  firstName: String,
  lastName: String,
  age: Number,
  Gender: String,
  address: String,
  email: { type: String, required: true },
  phone: String,
  designation: String,
  role: { type: mongoose.Schema.Types.ObjectId, ref: Role },
  status: Boolean,
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
  isApproved: { type: Boolean, default: false },
  // Add tasks as an array of TaskSchema
  tasks: [TaskSchema],
});

await addCreatedAtIST(employeeSchema);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;