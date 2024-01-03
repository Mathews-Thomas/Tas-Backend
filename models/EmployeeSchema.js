import mongoose from "mongoose";

const { Schema } = mongoose;

// const addressSchema = new Schema({
//     street: String,
//     city: String,
//     state: String,
//     country: String,
//     zipCode: String
// }, { _id: false });

 

const employeeSchema = new Schema({
    securityCredentials: {
      loginId: { type: String, required: true, unique: true },
      password: { type: String, required: true },
    },
  firstName: String,
  lastName: String,
  email: {type: String,required: true},
  phone: String,
  position: String,
  department: String,
  status: Boolean,
  createdAt: { type: String, required: true },
});

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
