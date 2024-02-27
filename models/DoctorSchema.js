import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import Department from "./DepartmentSchema.js";
import Procedure from "./ProcedureSchema.js";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: Number,
  Gender: String,
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  address:String,
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  procedureIds: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: Procedure,
  }],
  BranchID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Branch,
  },
  DepartmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Department,
  },
  createdAt: {

    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  isApproved: { type: Boolean, default: false },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
