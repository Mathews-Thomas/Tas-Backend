import mongoose from 'mongoose';
import Patient from './PatientSchema.js';
import Doctor from './DoctorSchema.js';
import Procedure from './ProcedureSchema.js';
import Department from './DepartmentSchema.js';
import Branch from './BranchSchema.js';
import PaymentMethod from './PaymentMethodSchema.js';
import { addCreatedAtIST } from '../Commonfn/ISTFormat.js';


const itemsSchema = new mongoose.Schema({
    ProcedureID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Procedure
    },
    description:{
        type:String
    },
    discount:{
        type:Number
    },
    discountType:{
        type:String
    },
    procedure:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    amountToBePaid:{
        type:Number,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    unitPrice:{
        type:Number,
        required:true
    }

})


const patientInvoiceSchema = new mongoose.Schema({
    invoiceID:{type:String,required:true},
    
    BranchID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Branch
    },
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
    items:[itemsSchema],
    amountToBePaid:{
        type:Number,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    totalDiscount:{
        type:Number
    },
    paymentMethod: {
        paymentMethod:String,
        paymentMethodID:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: PaymentMethod
        }
    },
    createdBy:String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    status:{type:Boolean,default:false},
    confirmPayment:{type:Boolean}
});
await addCreatedAtIST(patientInvoiceSchema)
const PatientInvoice = mongoose.model('PatientInvoice', patientInvoiceSchema);

export default PatientInvoice;



