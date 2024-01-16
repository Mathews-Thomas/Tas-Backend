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

  const existingPatient = await Patient.findOne({ Name, phone });

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
  const VisitorTypes = await VisitorType.find();
  const PatientTypes = await PatientType.find();
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
  const { page = 1, limit = 10, Name, phone, PatientID, search,startDate, endDate } = req.query;

  // Building a filter object for Mongoose query
  let filter = {};
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
        { Name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { PatientID: { $regex: search, $options: "i" } },
      ],
    };
  }
  const patients = await Patient.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  // Get the total number of patients to calculate total pages
  const count = await Patient.countDocuments(filter);

  res.status(200).json({
    patients,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
};


// ================================================
export const addInvoice = async (req,res)=>{
    const {patient,doctorId,DepartmentID,ProcedureID,salesAmount,ProcedureAmount,AmoutMethod,consultationFee,TotalAmount} = req.body
    
}


export const getInviuceDropdowns = async (req,res) =>{
  const { PatientID, BranchID } = req.query; 
  const companyInfo ={
    companyName: "TOPMOST KALAMASSERY",
  companyAddress: `OPPOSITE METRO PILLAR 316, PKA NAGAR,ALFIYA NAGARA, SOUTH KALAMASSRY, ERNAKULAM, KERALA
  KOCHI 682033 , 
  Phone: 7558011177
  Email: topmostkalamasserry@gmail.com`,
  }
  const [Doctors,Patients,Procedures, VisitorTypes, PatientTypes, branch,paymentMethods] = await Promise.all([
    Doctor.find().populate('DepartmentID'),
    Patient.findOne({PatientID}).populate('VisitorTypeID').populate('patientTypeID'),
    Procedure.find(),
    VisitorType.find(),
    PatientType.find(),
    Branch.findOne({ _id: BranchID }),
    PaymentMethod.find()
  ]);

  if (!branch) return res.status(404).send({ errors: "Branch not found." });

  const PatientInvoiceCount = await PatientInvoice.countDocuments({ BranchID });
  const nextInvoceID = `INV${branch.branchName[0]}${PatientInvoiceCount + 1}`;

  // Check for empty results
  if (!Doctors.length  || !Procedures.length || !VisitorTypes.length || !PatientTypes.length) {
    return res.status(404).send({ errors: "One or more dropdown lists are empty." });
  }

  if(!PatientID) return res.json({Patients:null, nextInvoceID,companyInfo, Doctors,  Procedures, VisitorTypes, PatientTypes,paymentMethods})

  res.status(200).json({ nextInvoceID,companyInfo,Patients, Doctors,  Procedures, VisitorTypes, PatientTypes,paymentMethods });
}