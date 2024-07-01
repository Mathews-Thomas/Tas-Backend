import mongoose from "mongoose";
import Medicine from "./MedicineSchema.js";
import Branch from "./BranchSchema.js";
import Patient from "./PatientSchema.js";
import Doctor from "./DoctorSchema.js";
import MainDepartment from "./HeadDepartmentSchema.js";
import PaymentMethod from "./PaymentMethodSchema.js";

const medicineItemsSchema = new mongoose.Schema({
  MedicineID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Medicine,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  amountToBePaid: {
    type: Number,
    
  },
  GST: {
    type: Number,
    required: true,
  },
  gstAmount: {
    type: Number,
    required: true,
  },
  baseAmount: {
    type: Number,
    
  },
});


const medicineInvoiceSchema = new mongoose.Schema({
  invoiceID: {
    type: String,
    required: true,
    unique: true,
  },
  BranchID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Branch,
  },
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Patient,
  },
  doctorID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: Doctor,
  },
  MainDepartmentID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: MainDepartment,
  },
  items: [medicineItemsSchema],
  amountToBePaid: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  totalDiscount: {
    type: Number,
  },
  paymentMethod: {
    paymentMethod: String,
    paymentMethodID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: PaymentMethod,
    }
  },
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: false,
  },
  confirmPayment: {
    type: Boolean,
  },
});

const MedicineInvoice = mongoose.model("MedicineInvoice", medicineInvoiceSchema);

export default MedicineInvoice;