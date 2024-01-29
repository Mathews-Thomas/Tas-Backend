import mongoose from 'mongoose'
import { addCreatedAtIST } from '../Commonfn/ISTFormat.js';

const RoleSchema = new mongoose.Schema({
    name: String,
    roleType:{type:String,enum: ['admin', 'user', 'guest']},
    permissions: [String],  
    createdBy: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    status:{type:Boolean,default:false}, 
});
await addCreatedAtIST(RoleSchema)
const Role = mongoose.model('Role', RoleSchema);

export default Role;
