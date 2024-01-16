import mongoose from 'mongoose';
import Patient from './PatientSchema.js';
import Doctor from './DoctorSchema.js';
import Procedure from './ProcedureSchema.js';
import Department from './DepartmentSchema.js';
import Branch from './BranchSchema.js';


const patientInvoiceSchema = new mongoose.Schema({
    patientID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Patient
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Doctor
    },
    DepartmentID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Department
    },
    ProcedureID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Procedure
    },
    salesAmount: {
        type: Number,
        required: true
    },
    ProcedureAmount: {
        type: Number,
        required: true
    },
    AmountMethod: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
    },
    TotalAmount: {
        type: Number,
        required: true
    },
    BranchID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Branch
    },
    createdBy:String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    status:{type:Boolean,default:false}
});

const PatientInvoice = mongoose.model('PatientInvoice', patientInvoiceSchema);

export default PatientInvoice;



