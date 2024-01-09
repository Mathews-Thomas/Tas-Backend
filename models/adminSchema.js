import mongoose from "mongoose";
import Role from "./RoleSchema.js";

const securityCredentialsSchema = new mongoose.Schema(
  {
    loginId: { type: String, unique: true ,lowercase: true},
    password: { type: String },
  },
  { _id: false }
);

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
  role: { type: mongoose.Schema.Types.ObjectId,  ref:Role },
  securityCredentials: securityCredentialsSchema,
  status: Boolean,
  createdAt: { type: String, required: true },
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
