import mongoose from 'mongoose'
import Department from './DepartmentSchema.js';
import { addCreatedAtIST } from '../Commonfn/ISTFormat.js';
const procedureSchema = new mongoose.Schema({
    procedure:{type:String,required:true,trim:true},
    description:{type:String,trim:true},
    Cost:{type:Number,required:true},
    DepartmentID: { type: mongoose.Schema.Types.ObjectId,  ref:Department },
    createdAt:{type:Date,default:Date.now}, 
    createdBy: { type: String, required: true, trim: true },
    status:{type:Boolean,default:false}
})
await addCreatedAtIST(procedureSchema)
const Procedure = mongoose.model('Procedure', procedureSchema);

export default Procedure;
