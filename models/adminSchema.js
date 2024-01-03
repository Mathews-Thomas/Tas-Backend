import mongoose from "mongoose";

const securityCredentialsSchema = new mongoose.Schema({
    loginId: { type: String ,
        unique: true},
    password: { type: String }
}, { _id: false });  

const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        required: true,
    },
    phone: String, 
    position: String,
    department: String,
    securityCredentials: securityCredentialsSchema,
    status:Boolean,
    createdAt: { type: String, required: true},
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
