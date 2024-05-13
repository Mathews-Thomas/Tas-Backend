import mongoose from "mongoose";
import { addCreatedAtIST } from "../Commonfn/ISTFormat.js"; 
import Branch from "./BranchSchema.js";

const appointmentSchema = new mongoose.Schema({
   branch_id:{type:mongoose.Schema.Types.ObjectId,ref:Branch},
   patient:{
      name:String,
      phone:String,
      age:Number,
      place:String
   },
   new_patient:Boolean,
   patient_id:String,  
   date_time:Date, 
   doctor_id:String,
   procedure_id:String,
   visit_type:{
      type:String,
      enum:["consultation","follow-up"]
   },
   note:String,
   status:{
      type:String,
      enum:["scheduled", "completed", "canceled"],
      default:"scheduled"
   }, 
   createdAt: { type: Date, default: Date.now },
   updatedAt:Date,
   createdBy:String, 
});
await addCreatedAtIST(appointmentSchema);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
