import mongoose from 'mongoose'
import Department from './DepartmentSchema.js';
import { addCreatedAtIST } from '../Commonfn/ISTFormat.js';
import Branch from './BranchSchema.js';
const procedureSchema = new mongoose.Schema({
    DepartmentID: { type: mongoose.Schema.Types.ObjectId,  ref:Department },
    BranchID: { type: mongoose.Schema.Types.ObjectId,  ref:Branch },
    procedure:{type:String,required:true,trim:true},
    description:{type:String,trim:true},
    gstOption:String,
    HSNCode:String,
    GST:Number,
    createdAt:{type:Date,default:Date.now}, 
    createdBy: { type: String, required: true, trim: true },
    status:{type:Boolean,default:false},
    isApproved:{type:Boolean,default:false},
})


await addCreatedAtIST(procedureSchema)
const Procedure = mongoose.model('Procedure', procedureSchema);

export default Procedure;
