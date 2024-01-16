import mongoose from "mongoose";

import { addCreatedAtIST } from "../Commonfn/ISTFormat.js";

const patientTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, trim: true },
  description: { type: String, required: false, trim: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true, trim: true },
  status:{type:Boolean,default:false}
});
await addCreatedAtIST(patientTypeSchema)

const PatientType = mongoose.model("PatientType", patientTypeSchema);

export default PatientType;