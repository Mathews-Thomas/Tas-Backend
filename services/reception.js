import Employee from "../models/EmployeeSchema.js";
import Patient from "../models/PatientSchema.js";
import { validateInputs } from "../validation/validate.js";
import { jwtSign } from "./Jwt.js";
import bcrypt from "bcrypt";
import Branch from "../models/BranchSchema.js";
import VisitorType from "../models/visitorTypeSchema.js";
import PatientType from "../models/patientTypeSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Procedure from "../models/ProcedureSchema.js";
import PatientInvoice from "../models/PatientInvoiceSchema.js";
import PaymentMethod from "../models/PaymentMethodSchema.js";
import Alert from "../models/AlertSchema.js" 
import mongoose from "mongoose";

// ================================================
export const employeeLogin = async (req, res) => {
 
  const { loginId, password } = req.body;

  const validationErrors = validateInputs([
    [loginId, "loginId", "user id"],
    [password, "password", "password"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const employee = await Employee.findOne({
    "securityCredentials.loginId": loginId,
  }).populate("role");
  if (!employee) return res.status(401).json({ err: "Username mismatched" });
  if (!employee.status || !employee.isApproved)
    return res
      .status(403)
      .json({
        err: "Access denied. Please contact the administrator.",
      });

  const isPasswordMatch = await bcrypt.compare(
    password,
    employee.securityCredentials.password
  );
  if (!isPasswordMatch)
    return res.status(401).json({ err: "Password mismatched" });

  const employeeData = employee.toObject();
  delete employeeData.securityCredentials.password; // Remove password for security
  const token = jwtSign(employeeData._id.toString());
  return res.status(200).json({ Employee: employeeData, token: token });
};

// ================================================
export const addPatient = async (req, res) => { 
  const {
    Name,
    age,
    Gender,
    address,
    phone,
    email,
    VisitorTypeID,
    patientTypeID,
    PatientID,
    BranchID,
  } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([
    [Name, "name", "Name"],
    [age, "age", "age"],
    [Gender, "gender", "Gender"],
    [phone, "phone", "phone"],
    [BranchID, "BranchID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const existingPatient = await Patient.findOne({BranchID, Name, phone });

  if (existingPatient)
    return res.status(400).send({ errors: "Patient already exists." });
  const patientCount = await Patient.countDocuments({ BranchID });
  const { branchName } = await Branch.findOne({ _id: BranchID });
  const newPatient = {
    PatientID: `TM${branchName[0]}${
      patientCount + 1 === Number(PatientID) ? PatientID : patientCount + 1
    }`,
    Name,
    age,
    Gender,
    address: address ? address : "",
    phone,
    email: email ? email : "",
    VisitorTypeID,
    patientTypeID,
    createdBy: firstName + " " + lastName,
    BranchID,
    status: true,
  };

  (await (await Patient.create(newPatient)).populate("patientTypeID"))
    .populate("patientTypeID")
    .then((data) =>
      res
        .status(200)
        .json({ message: "New Patient created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};

// ================================================
export const getAddPatient = async (req, res) => {

  
  const BranchID = req.params.BranchID;
  const VisitorTypes = await VisitorType.find({ status: true ,isApproved:true});
  const PatientTypes = await PatientType.find({ status: true,isApproved:true });
  const { branchName } = await Branch.findOne({ _id: BranchID });
  const PatientCout = await Patient.countDocuments({ BranchID });
  const nextPatientID = `TM${branchName[0]}${PatientCout + 1}`;

  if (!VisitorTypes)
    res.status(400).send({ errors: "VisitorTypes not exists." });
  if (!PatientTypes)
    res.status(400).send({ errors: "PatientTypes not exists." });

  res
    .status(200)
    .json({ nextPatientID: nextPatientID, VisitorTypes, PatientTypes });
};

// ================================================
export const getPatientList = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    Name,
    phone,
    PatientID,
    search,
    startDate,
    endDate,
  } = req.query;
  const BranchID = req.params.BranchID;
  // Building a filter object for Mongoose query
  let filter = { BranchID, status: true };
  if (Name) filter.Name = { $regex: Name, $options: "i" }; // Case-insensitive search
  if (phone) filter.phone = phone;
  if (PatientID) filter.PatientID = { $regex: PatientID, $options: "i" };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }
  if (search) {
    filter = {
      $or: [
        { Name: { $regex: search, $options: "i" }, status: true },
        { phone: { $regex: search, $options: "i" }, status: true },
        { PatientID: { $regex: search, $options: "i" }, status: true },
      ],
    };
  }
  const patients = await Patient.find({BranchID,...filter})
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Get the total number of patients to calculate total pages
  const count = await Patient.countDocuments(filter)
    .populate("VisitorTypeID")
    .populate("patientTypeID");

  res.status(200).json({
    patients,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
};

// ================================================
export const addInvoice = async (req, res) => {
  const {
    invoiceID,
    patient,
    doctorID,
    DepartmentID,
    items,
    totalAmount,
    BranchID,
    paymentMethod,
    paymentMethodID,
    totalDiscount,
    amountToBePaid,
  } = req.body;
  const { firstName, lastName } = req.verifiedUser;

  const validationErrors = await validateInputs([
    [doctorID, "objectID", "doctorID"],
    [DepartmentID, "objectID", "DepartmentID"],
    [paymentMethodID, "objectID", "paymentMethodID"],
    [patient._id, "objectID", "patientID"],
    [invoiceID, "name", "invoiceID"],
    [totalAmount, "price", "totalAmount"],
    [amountToBePaid, "price", "amountToBePaid"],
    [BranchID, "BranchID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newInvoice = {
    invoiceID: invoiceID,
    patientID: patient._id,
    doctorID: doctorID,
    DepartmentID: DepartmentID,
    paymentMethod: {
      paymentMethod,
      paymentMethodID,
    },
    items: items,
    totalAmount: totalAmount,
    totalDiscount: totalDiscount,
    amountToBePaid: amountToBePaid,
    createdBy: firstName + " " + lastName,
    BranchID: BranchID,
    status: true,
  };

  PatientInvoice.create(newInvoice)
    .then((resp) => {
      Patient.findOneAndUpdate(
        { _id: patient._id },
        { $push: { Invoices: resp?._id } },
        { new: true }
      )
        .then(() => {})
        .catch((updateErr) => {
          res.status(400).json({ error: "Error updating patient:", updateErr });
        });
      res.status(200).json({ message: "Invoice created", data: resp });
    })
    .catch((err) => {
      res.status(400).json({ error: "Error creating invoice", err });
    });
};

//========================================================
export const getInviuceDropdowns = async (req, res) => {
  const { PatientID, BranchID } = req.query;
  const { firstName, lastName } = req.verifiedUser;
 

    const [
    Doctors, 
    Patients,
    Procedures,
    VisitorTypes,
    PatientTypes,
    branch,
    paymentMethods,
  ] = await Promise.all([
    Doctor.find({BranchID, status: true ,isApproved:true}).populate("DepartmentID"), 
    Patient.findOne({PatientID })  
      .populate("VisitorTypeID")
      .populate("patientTypeID"),
    Procedure.find({ status: true ,isApproved:true,BranchID}),
    VisitorType.find({ status: true  ,isApproved:true}),
    PatientType.find({ status: true  ,isApproved:true}),
    Branch.findOne({ _id: BranchID  ,isApproved:true},{securityCredentials:0}),
    PaymentMethod.find({ status: true  ,isApproved:true}),
  ]);

  if (!branch) return res.status(404).send({ errors: "Branch not found." });

  const PatientInvoiceCount = await PatientInvoice.countDocuments({ BranchID });
  const nextInvoceID = `INV${branch.branchName[0].toUpperCase()}${PatientInvoiceCount + 1}`;

  // Check for empty results

   if (
    !Doctors.length ||
    !Procedures.length ||
    !VisitorTypes.length ||
    !PatientTypes.length
  ) {
    return res
      .status(404)
      .send({ errors: "One or more dropdown lists are empty." });
  }

  if (!PatientID)
    return res.json({
      Patients: null,
      nextInvoceID,
      branch,
      Doctors,
      Procedures,
      VisitorTypes,
      PatientTypes,
      paymentMethods,
      createdBy: firstName + " " + lastName,
    });

  res
    .status(200)
    .json({
      nextInvoceID,
      branch,
      Patients,
      Doctors,
      Procedures,
      VisitorTypes,
      PatientTypes,
      paymentMethods,
      createdBy: firstName + " " + lastName,
    });
};


//===========================================================
export const getPatientInvoiceList = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    Name,
    phone,
    PatientID,
    invoiceID,
    search,
    startDate,
    endDate,
  } = req.query;
  const { BranchID } = req.params;
  const companyInfo = {
    companyName: "TOPMOST KALAMASSERY",
    companyAddress: `OPPOSITE METRO PILLAR 316, PKA NAGAR,ALFIYA NAGARA, SOUTH KALAMASSRY, ERNAKULAM, KERALA
  KOCHI 682033 , 
  Phone:7558011177
  Email:topmostkalamasserry@gmail.com`,
  };

  // Building a filter object for Mongoose query
  let filter = { status: true };

  if (BranchID) filter.BranchID = BranchID;
  if (PatientID) {
    filter.PatientID = { $regex: PatientID, $options: "i" };
  }
  if (invoiceID) filter.invoiceID = { $regex: invoiceID, $options: "i" };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }
  if (search) {
    filter = {
      $or: [
        {
          invoiceID: { $regex: search, $options: "i" },
          status: true,
          BranchID: BranchID,
        },
      ],
    };
  }

  const patientInvoice = await PatientInvoice.find(filter)
    .populate("doctorID")
    .populate("patientID")
    .populate("DepartmentID").populate({
      path: 'items.ProcedureID', // Specify the path to the field you want to populate
      model: 'Procedure' // Specify the model name associated with the ObjectId
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Get the total number of patients to calculate total pages
  const count = await PatientInvoice.countDocuments(filter);
  res.status(200).json({
    patientInvoice,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    companyInfo,
  });

};

//==========================================================
 export const get_alert = async (req,res)=>{
   const { BranchID } = req.params;
   const validationErrors = await validateInputs ([
    [BranchID,"BranchID","BranchID"]
   ])
   if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });
    
    const today = new Date(); 
    const alerts = await Alert.find({
      status:true,
      BranchID,
        startDate: { $lte: today },
        endDate: { $gte: today }
    });

    if(!alerts) return res.status(404).send("Document not found");

    res.status(200).send(alerts)

 }

export const get_branch =async (req,res)=>{
  const { BranchID } = req.params;
  const validationErrors = await validateInputs ([
   [BranchID,"BranchID","BranchID"]
  ])
  if (Object.keys(validationErrors).length > 0)
   return res.status(400).json({ errors: validationErrors });

  const branch = await Branch.findById({_id:BranchID},{securityCredentials:0})
  if(!branch) return res.status(404).send("branch not found");

    res.status(200).send(branch)
}

// ================================================
export const edit_Patient = async (req, res) => {  
  const {
    Name,
    age,
    Gender,
    address,
    phone,
    email,
    VisitorTypeID,
    patientTypeID,
    PatientID,
    BranchID,
  } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([
    [Name, "name", "Name"],
    [age, "age", "age"],
    [Gender, "gender", "Gender"],
    [phone, "phone", "phone"],
    [BranchID, "BranchID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });
  
  const updatedPatient = {
    PatientID:  PatientID ,
    Name,
    age,
    Gender,
    address: address ? address : "",
    phone,
    email: email ? email : "",
    VisitorTypeID,
    patientTypeID,
    createdBy: firstName + " " + lastName,
    BranchID, 
  };

   await Patient.updateOne({PatientID},updatedPatient).then((data) =>
      res
        .status(200)
        .json({ message: "Patient updated successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};



// ================================================
export const editInvoice = async (req, res) => {
  
  const {
    invoiceID,
    patient,
    doctorID,
    DepartmentID,
    items,
    totalAmount,
    BranchID,
    paymentMethod,
    paymentMethodID,
    totalDiscount,
    amountToBePaid,
  } = req.body;
  const { firstName, lastName } = req.verifiedUser;

  const validationErrors = await validateInputs([
    [doctorID, "objectID", "doctorID"],
    [DepartmentID, "objectID", "DepartmentID"],
    [paymentMethodID, "objectID", "paymentMethodID"],
    [patient._id, "objectID", "patientID"],
    [invoiceID, "name", "invoiceID"],
    [totalAmount, "price", "totalAmount"],
    [amountToBePaid, "price", "amountToBePaid"],
    [BranchID, "BranchID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newInvoice = {
    patientID: patient._id,
    doctorID: doctorID,
    DepartmentID: DepartmentID,
    paymentMethod: {
      paymentMethod,
      paymentMethodID,
    },
    items: items,
    totalAmount: totalAmount,
    totalDiscount: totalDiscount,
    amountToBePaid: amountToBePaid,
    createdBy: firstName + " " + lastName,
    BranchID: BranchID,
    status: true,
  }; 
  PatientInvoice.updateOne({invoiceID}, newInvoice)
    .then((resp) => { 
      res.status(200).json({ message: "Invoice created", data: resp });
    })
    .catch((err) => {
      res.status(400).json({ error: "Error creating invoice", err });
    });
};

export const delete_invoice = async (req,res)=>{ 
const { invoiceID } = req.params;
try {
    // Find the invoice to get the patientID before deletion
    const invoiceToDelete = await PatientInvoice.findById(invoiceID);
    if (!invoiceToDelete) {
        return res.status(404).send({ message: 'Invoice not found' });
    }
    const patientID = invoiceToDelete.patientID;

    // Delete the invoice
    await PatientInvoice.findByIdAndDelete(invoiceID);

    // Remove the invoice ID from the patient's Invoices array
    await Patient.findByIdAndUpdate(patientID, {
        $pull: { Invoices: new mongoose.Types.ObjectId(invoiceID) }
    });

    res.status(200).send({ message: 'Invoice deleted successfully' });
} catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).send({ message: 'Failed to delete invoice' });
}






}

