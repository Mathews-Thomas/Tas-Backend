import mongoose from "mongoose";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";
import Branch from "./BranchSchema.js";
import VisitorType from "./visitorTypeSchema.js";
import PatientType from "./patientTypeSchema.js";

const patientSchema = new mongoose.Schema({
  PatientID: {type:String},
  Name: String,
  age: Number,
  Gender:String,
  address:{
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  phone: String,
  email:String,
  Invoices:[String],
  VisitorTypeID:{type:mongoose.Schema.Types.ObjectId,ref:VisitorType},
  patientTypeID:{type:mongoose.Schema.Types.ObjectId,ref:PatientType},
  createdAt: { type: Date, default: Date.now },
  createdBy:String,
  status: Boolean,
  BranchID:{type:mongoose.Schema.Types.ObjectId,ref:Branch},
});
await addCreatedAtIST(patientSchema);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
