import mongoose from "mongoose";
import Medicine from "./MedicineSchema";
import Branch from "./BranchSchema";
import Patient from "./PatientSchema";
import Doctor from "./DoctorSchema";
import MainDepartment from "./HeadDepartmentSchema";
import PaymentMethod from "./PaymentMethodSchema";
import { addCreatedAtIST } from "../Commonfn/ISTFormat";

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
  discountType: {
    type: String,
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
    required: true,
  },
  GST: {
    type: Number,
    requiered: true,
  },
  gstAmount: {
    type: Number,
    required: true,
  },
  baseAmount: {
    type: Number,
    required: true,
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
    paymentMethodID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: PaymentMethod,
    },
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

await addCreatedAtIST(medicineInvoiceSchema);
const MedicineInvoice = mongoose.model("MedicineInvoice", medicineInvoiceSchema);
 
export default MedicineInvoice;