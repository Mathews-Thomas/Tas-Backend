import mongoose from "mongoose";
const { Schema } = mongoose;

// Location Sub-schema
const locationSchema = new Schema(
  {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
  },
  { _id: false }
);

// Contact Sub-schema
const contactSchema = new Schema(
  {
    phone: String,
    email: String,
  },
  { _id: false }      
);

// Security Credentials Sub-schema
const securityCredentialsSchema = new Schema(
  {
    loginId: { type: String, lowercase: true },
    password: String, // Ensure this is hashed and secured
  },
  { _id: false }
);

// Main Branch Schema
const branchSchema = new Schema({
  branchName: String,
  location: locationSchema,
  contact: contactSchema,
  securityCredentials: securityCredentialsSchema,
});

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
