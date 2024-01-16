import mongoose from 'mongoose'
import { addCreatedAtIST } from '../Commonfn/ISTFormat.js';

const RoleSchema = new mongoose.Schema({
    name: String,
    roleType:String,
    permissions: [String], 
    createdAt: { type: Date, default: Date.now },
});
await addCreatedAtIST(RoleSchema)
const Role = mongoose.model('Role', RoleSchema);

export default Role;
