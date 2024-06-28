import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import Department from "./DepartmentSchema.js";
import MainDepartment from "./HeadDepartmentSchema.js";

const medicineSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },

  expirationDate: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Branch,
    required: true,
  },
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: MainDepartment,
      required: true,
    },
  ],
  status: {
    type: Boolean,
    required: true,
    default: false,
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
  HSNCode: String,
  gst: Number,
  manufacturerName: String,
  gstOption:String,
  editedBy: { type: String, trim: true },
});

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
