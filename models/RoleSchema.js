import mongoose from 'mongoose'

const RoleSchema = new mongoose.Schema({
    name: String,
    roleType:String,
    permissions: [String], // You can also reference a Permission model here
});

const Role = mongoose.model('Role', RoleSchema);

export default Role;
