import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import Department from "./DepartmentSchema.js";

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: Number,
  Gender:String,
  specialization: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
      type: String,
      trim: true,
    },
  phone: {
      type: String,
      trim: true,
    },
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
  status:{
    type:Boolean,
    required:true,
    default:false
  }
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
