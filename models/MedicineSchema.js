import mongoose from "mongoose";
import Branch from "./BranchSchema.js";
import Department from "./DepartmentSchema.js";

const medicineSchema = new mongoose.Schema({
  name: {
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
  strength: {
    type: Number,
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: String,
    trim: true
  },
  BranchID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Branch,
  },
  DepartmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Department,
  },
  status: {
    type: Boolean,
  },
});

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
