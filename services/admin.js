import Branch from "../models/BranchSchema.js";
import Employee from "../models/EmployeeSchema.js";
import Role from "../models/RoleSchema.js";
import { validateInputs } from "../validation/validate.js";
import { jwtSign } from "./Jwt.js";
import bcrypt from "bcrypt";
import Department from "../models/DepartmentSchema.js";
import PaymentMethod from "../models/PaymentMethodSchema.js";
import VisitorType from "../models/visitorTypeSchema.js";
import PatientType from "../models/patientTypeSchema.js";
import Procedure from "../models/ProcedureSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Alert from "../models/AlertSchema.js";
import PatientInvoice from "../models/PatientInvoiceSchema.js";
import moment from "moment-timezone";
import mongoose from "mongoose";

const models = {
  Branch,
  Employee,
  Role,
  Department,
  PaymentMethod,
  VisitorType,
  PatientType,
  Procedure,
  Doctor,
  Alert,
};

export const employeeRegister = async (req, res) => {
  const {
    firstName,
    lastName,
    age,
    Gender,
    address,
    email,
    phone,
    designation,
    password,
    loginId,
    role,
  } = req.body;
  const createdAt = new Date();
  const Role = req?.verifiedUser?.role?.roleType;
  const validationErrors = await validateInputs([
    [firstName, "name", "firstName"],
    [lastName, "name", "lastName"],
    [email, "email", "email"],
    [phone, "phone", "phone"],
    [designation, "name", "designation"],
    [role, "role", "role"],
    [age, "age", "Age"],
    [Gender, "Gender", "gender"],
    [address, "address", "Address"],
  ]);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const userExist = await Employee.findOne({
    "securityCredentials.loginId": loginId,
  });
  if (userExist)
    return res.status(400).json({ error: "Username already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newEmployee = {
    firstName,
    lastName,
    age,
    Gender,
    address,
    email,
    phone,
    designation,
    role,
    createdAt,
    securityCredentials: {
      loginId,
      password: hashedPassword,
    },
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

  const emp = await Employee.create(newEmployee);
  const { securityCredentials: _, ...EmpData } = emp.toObject();

  return res
    .status(200)
    .json({ message: "Employee registered successfully", EmpData });
};
//==============================================================================================
export const BranchRegister = async (req, res) => {
  const {
    branchName,
    address,
    city,
    state,
    country,
    pincode,
    phone,
    email,
    password,
    loginId,
  } = req.body;
  const Role = req?.verifiedUser?.role?.roleType;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([
    [branchName, "name", "branchName"],
    [address, "address", "address"],
    [city, "name", "city"],
    [state, "name", "state"],
    [country, "name", "country"],
    [pincode, "zip", "pincode"],
    [phone, "phone", "Phone Number"],
    [email, "email", "email"],
    [loginId, "loginId", "user id"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const BranchExist = await Branch.findOne({
    "securityCredentials.loginId": loginId,
  });
  if (BranchExist)
    return res.status(400).json({ errors: "Branch id already existed" });

  const encryptedPassword = await bcrypt.hash(password, 10);

  const newBranch = {
    branchName,
    address,
    city,
    state,
    country,
    pincode,
    phone,
    email,
    securityCredentials: {
      loginId,
      password: encryptedPassword,
    },
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };
  const createdBranch = await Branch.create(newBranch);

  const { securityCredentials: _, ...branchData } = createdBranch.toObject();
  return res
    .status(200)
    .json({ message: "Branch registered successfully", ...branchData });
};
//==============================================================================================
export const AddRole = async (req, res) => {
  const { name, permissions, roleType,createdBy } = req.body;
  const validationErrors = await validateInputs([
    [name, "name", "Empoyee Position"],
    [roleType, "name", "Role Type"],
    [permissions, "permissions", "permissions"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const NameExist = await Role.findOne({ name: name });

  if (NameExist)
    return res.status(400).json({ errors: "Role Name is already existed" });

  const NewRole = Role.create({ name, permissions, roleType,createdBy });
  return res.status(200).json(NewRole);
};
//==============================================================================================
export const addDepartment = async (req, res) => {
  const { Name, BranchID } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([
    [Name, "name", "Department Name"],
    [BranchID, "objectID", "Branch"],
  ]);
  const Role = req?.verifiedUser?.role?.roleType;
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  let newDepartment = {
    Name,
    BranchID,
    createdBy: firstName + " " + lastName ,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };
  const DepartmentExist = await Department.findOne({
    Name: new RegExp(`^${Name}$`, "i"),
    BranchID: BranchID,
  });

  if (DepartmentExist)
    return res
      .status(400)
      .json({ errors: "Department Name is already existed" });

  Department.create(newDepartment)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New Department created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//==============================================================================================
export const addPatientType = async (req, res) => {
  const { type, description } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;

  const validationErrors = await validateInputs([
    [type, "name", "type"],
    [description, "address", "description"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newPatientType = {
    type: type,
    description,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };
  const typeExists = await PatientType.findOne({
    type: new RegExp("^" + type.trim() + "$", "i"),
  });
  if (typeExists)
    return res.status(400).json({ error: "Patient type already exists" });

  PatientType.create(newPatientType)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New PatientType created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//==============================================================================================
export const addVisitorType = async (req, res) => {
  const { type, description } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;

  const validationErrors = await validateInputs([
    [type, "name", "type"],
    [description, "address", "description"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newVisitorTypes = {
    type: type,
    description,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };
  const typeExists = await VisitorType.findOne({
    type: new RegExp("^" + type.trim() + "$", "i"),
  });
  if (typeExists)
    return res.status(400).json({ error: "visitorType already exists" });

  VisitorType.create(newVisitorTypes)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New VisitorType created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//==============================================================================================
export const addPaymentMethod = async (req, res) => {
  const Role = req?.verifiedUser?.role?.roleType;
  const { Method } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([[Method, "name", "Method"]]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newPaymentMethod = {
    Method: Method,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

  const methodExists = await PaymentMethod.findOne({
    type: new RegExp("^" + Method.trim() + "$", "i"),
  });
  if (methodExists)
    return res.status(400).json({ error: "paymentMethod already exists" });
  PaymentMethod.create(newPaymentMethod)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New paymentMethod created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//==============================================================================================
export const addprocedure = async (req, res) => {
  const {
    procedure,
    description,
    GST,
    gstOption,
    HSNCode,
    BranchID,
    DepartmentID,
  } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;
  const validationErrors = await validateInputs([
    [procedure, "address", "procedure"],
    [DepartmentID, "objectID", "DepartmentID"],
    [description, "address", "description"],
    [gstOption === "non-exception" && [GST, "GST", "GST"]],
    [HSNCode, "name", "HSNCode"],
    [BranchID, "BranchID", "Branch ID"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newProcedure = {
    BranchID,
    DepartmentID,
    procedure,
    description,
    GST: GST ? GST : 0,
    gstOption,
    HSNCode,
    createdBy: firstName + " " + lastName,
    status: true,
    isApproved: true,
  };

  const procedureExists = await Procedure.findOne({
    procedure: new RegExp("^" + procedure.trim() + "$", "i"),
    DepartmentID: DepartmentID,
  });
  if (procedureExists)
    return res.status(400).json({ error: "Procedure already exists" });
  Procedure.create(newProcedure)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New Procedure created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//==============================================================================================
export const adddoctor = async (req, res) => {
  const {
    name,
    age,
    Gender,
    specialization,
    phone,
    email,
    BranchID,
    DepartmentID,
    address,
    ProcedureIds
  } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;

  const validationErrors = await validateInputs([
    [name, "name", "name"],
    [age, "age", "age"],
    [Gender, "gender", "Gender"],
    [address, "address", "address"],
    [DepartmentID, "objectID", "DepartmentID"],
    [BranchID, "objectID", "BranchID"],
    [specialization, "address", "specialization"],
    [phone, "phone", "phone"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });
console.log(ProcedureIds,"kjhsdfkljh")
  const newDoctor = {
    name,
    age,
    Gender,
    specialization,
    DepartmentID,
    BranchID,
    procedureIds:[...ProcedureIds],
    phone,
    email,
    address,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

 
  const DoctorExists = await Doctor.findOne({
    name: new RegExp("^" + name.trim() + "$", "i"),
  });
  if (DoctorExists)
    return res.status(400).json({ error: "Doctor already exists" });
  Doctor.create(newDoctor)
    .then((data) =>
      res.status(200).json({ message: "New Doctor Added successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//==============================================================================================
export const Get_add_doctor = async (req, res) => {
  const Departments = await Department.find({
    status: true,
    isApproved: true,
  }).populate("BranchID").sort({BranchID:1})
  const Branches = await Branch.find({ status: true, isApproved: true })
  const Procedures = await Procedure.find({ status: true, isApproved: true }).populate("BranchID").sort({BranchID:1})
  if (!Branches)
    return res
      .status(400)
      .json({ message: "Branches Not added", status: false });
  if (!Departments)
    return res
      .status(400)
      .json({ message: "Departments Not available", status: false });
  if (!Procedures)
    return res
      .status(400)
      .json({ message: "Procedures Not available", status: false });

  return res.status(200).json({ status: true, Branches, Departments,Procedures });
};
//==============================================================================================
export const get_addOns = async (req, res) => {
  const Departments = await Department.find({
    status: true,
    isApproved: true,
  }).populate("BranchID");
  const Branches = await Branch.find({ status: true, isApproved: true });
  const roleType = await Role.find({status: true});

  if (!Branches)
    return res
      .status(400)
      .json({ message: "Branches Not added", status: false });
  if (!Departments)
    return res
      .status(400)
      .json({ message: "Departments Not available", status: false });
  if (!roleType)
    return res.status(400).json({ message: "Roles Not available" });

  return res
    .status(200)
    .json({ status: true, Branches, Departments, roleType });
};
//==============================================================================================
export const list_addOns = async (req, res) => {
  const results = await Promise.all([
    Branch.find().sort({ createdAt: -1 }),
    PaymentMethod.find().sort({ createdAt: -1 }),
    Procedure.find().sort({ createdAt: -1 }),
    Department.find().sort({ createdAt: -1 }),
    VisitorType.find().sort({ createdAt: -1 }),
    PatientType.find().sort({ createdAt: -1 }),
    Alert.find().sort({ createdAt: -1 }),
  ]);

  const [Branches,PaymentMethods,procedures,departments,VisitorTypes,PatientTypes,alerts] = results;
  const branchMap = Branches.reduce((map, branch) => {
    map[branch._id] = branch.branchName;
    return map;
  }, {});

  const DepartmentMap = departments.reduce((map, departmnt) => {
    map[departmnt._id] = departmnt.Name;
    return map;
  }, {});

  // Add BranchName to each Department and Procedure
  const Departments = departments.map((dept) => ({
    ...dept.toObject({ virtuals: true }),
    BranchName: branchMap[dept.BranchID],
  }));
  const convertTime = (date) => {
    if (typeof date === "string") {
      return date.split("T")[0];
    } else if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }
  };

  const Alerts = alerts.map((alert) => ({
    ...alert.toObject({ virtuals: true }),
    BranchName: branchMap[alert.BranchID],
    endDate: convertTime(alert.endDate),
    startDate: convertTime(alert.startDate),
  }));

  const Procedures = procedures.map((proc) => ({
    ...proc.toObject({ virtuals: true }),
    DepartmentName: DepartmentMap[proc.DepartmentID],
    BranchName: branchMap[proc.BranchID],
  }));
  return res.status(200).json({
    status: true,
    Branches,
    PaymentMethods,
    Procedures,
    Departments,
    VisitorTypes,
    PatientTypes,
    Alerts,
  });
};
//==============================================================================================
export const list_doctors = async (req, res) => {
  const results = await Promise.all([
    Branch.find(),
    Department.find(),
    Doctor.find(),
  ]);

  const [Branches, departments, doctors] = results;
  // Create a mapping from BranchID to BranchName
  const branchMap = Branches.reduce((map, branch) => {
    map[branch._id] = branch.branchName;
    return map;
  }, {});

  const DepartmentMap = departments.reduce((map, departmnt) => {
    map[departmnt._id] = departmnt.Name;
    return map;
  }, {});

  // Add BranchName to each Department and Procedure
  const Doctors = doctors.map((dr) => ({
    ...dr.toObject({ virtuals: true }),
    BranchName: branchMap[dr.BranchID],
    DepartmentName: DepartmentMap[dr.DepartmentID],
  }));

  return res.status(200).json({
    status: true,
    Doctors,
  });
};
//==============================================================================================
export const updateStatus = async (req, res) => {
  const { id, status } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne(
    { _id: id },
    { $set: { status: status } }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: collectionName + "updated Succussfully",
    updatedDocument,
  });
};

//==============================================================================================
export const approve = async (req, res) => {
  const { id } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne(
    { _id: id },
    { $set: { isApproved: true,status:true } }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: collectionName + "updated Succussfully",
    updatedDocument,
  });
};

//==============================================================================================
export const set_alert = async (req, res) => {
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;
  const { msg, type, endDate, startDate, BranchID } = req.body;
  const validationErrors = await validateInputs([
    [msg, "address", "Message"],
    [type, "name", "Type"],
    [BranchID, "BranchID", "BranchID"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });
  const expiry = new Date(endDate);
  expiry.setUTCHours(23, 59, 59, 999);
  const newAlert = {
    msg,
    type,
    startDate,
    endDate: expiry,
    BranchID,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

  Alert.create(newAlert)
    .then((resp) => {
      return res.status(200).json({ message: `New Message Added`, resp });
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
};
//==============================================================================================
export const get_Branches = async (req, res) => {
  const Branches = await Branch.find({ status: true, isApproved: true });

  if (!Branches)
    return res
      .status(400)
      .json({ message: "Branches Not added", status: false });
  return res.status(200).json({ status: true, Branches });
};

//===============================================================================================
export const report_filter = async (req, res) => {
  const {
    BranchID,
    doctorID,
    DepartmentID,
    ProcedureID,
    GST,
    paymentMethod,
    createdBy,
    startDate,
    endDate,
    visitorTypeId,
    patientTypeId,
    StartAge,
    EndAge,
    Gender,
    page = 1,
    pageSize = 10,
  } = req.query; 
  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );


// First, ensure that startDate and endDate are either valid date strings or fallback to defaults
const processedStartDate = startDate ? new Date(startDate) : oneMonthAgo;
const processedEndDate = endDate ? new Date(endDate) : now;

// Then, explicitly set the hours for startDate and endDate
processedStartDate.setUTCHours(0, 0, 0, 0);
processedEndDate.setUTCHours(23, 59, 59, 999);

// Now, use these processed dates in your query
let matchFilters = {
  createdAt: {
    $gte: processedStartDate,
    $lte: processedEndDate,
  },
}; 
  if (BranchID) matchFilters["BranchID"] = new mongoose.Types.ObjectId(BranchID);
  if (doctorID) matchFilters["doctorID"] = new mongoose.Types.ObjectId(doctorID);
  if (DepartmentID) matchFilters["DepartmentID"] = new mongoose.Types.ObjectId(DepartmentID);
  if (ProcedureID) matchFilters["items.ProcedureID"] = new mongoose.Types.ObjectId(ProcedureID);
  if (GST) matchFilters["items.GST"] = Number(GST);
  if (paymentMethod) matchFilters["paymentMethod.paymentMethodID"] = new mongoose.Types.ObjectId(paymentMethod);
  if (createdBy) matchFilters["createdBy"] = { $regex: new RegExp(createdBy, 'i') }; ;
 
  
  const patientInfoFilters = {};
  if (visitorTypeId) patientInfoFilters["patientInfo.VisitorTypeID"] = new mongoose.Types.ObjectId(visitorTypeId);
  if (patientTypeId) patientInfoFilters["patientInfo.patientTypeID"] = new mongoose.Types.ObjectId(patientTypeId);
  if (Gender) patientInfoFilters["patientInfo.Gender"] = Gender;
  if (StartAge && EndAge) {
    patientInfoFilters["patientInfo.age"] = {
      $gte: parseInt(StartAge, 10),
      $lte: parseInt(EndAge, 10),
    };
  }
  let itemsMatchConditions = {};
  if (ProcedureID) itemsMatchConditions["items.ProcedureID"] = new mongoose.Types.ObjectId(ProcedureID);
  if (GST) itemsMatchConditions["items.GST"] = Number(GST);

  let totalPipeline = [
    { $match: matchFilters },
    {
      $lookup: {
        from: "patients",
        localField: "patientID",
        foreignField: "_id",
        as: "patientInfo",
      },
    },
    { $unwind: "$patientInfo" }, 
    ...Object.keys(patientInfoFilters).length > 0 ? [{ $match: patientInfoFilters }] : [],
    {
      $facet: { 
        "total": [{ $count: "count" }],        
        "invoices": [
          { $skip: (Number(page) - 1) * Number(pageSize) },
          { $limit: Number(pageSize) } 
        ],
        "summaries": [
          { $unwind: "$items" },
          {$match:itemsMatchConditions },
          {
            $group: {
              _id: "$items.GST",
              totalAmountToBePaid: { $sum: "$amountToBePaid" },
              totalGstAmount: { $sum: "$items.gstAmount" },
              totalBaseAmount: { $sum: "$items.baseAmount" },
              totalCount: { $sum: 1 },
            }
          }
        ],
        globalSums: [
          {
            $group: {
              _id: null,
              totalAmountToBePaidSum: { $sum: "$amountToBePaid" },
              totalAmountSum: { $sum: "$totalAmount" },
              totalDiscountSum: { $sum: "$totalDiscount" },
              total: { $sum: 1 },
            },
          },
        ],
      }
    }
  ]; 
   
  // Execute the total calculation pipeline
  const results = await PatientInvoice.aggregate(totalPipeline)   
  const count = results.length > 0 && results[0].total.length > 0 ? results[0].total[0].count : 0;
  const invoices = results.length > 0 ? results[0].invoices : [];
  const summaries = results.length > 0 ? results[0].summaries : [];
  const globalSums = results.length > 0 ? results[0].globalSums[0] : [];
 
 return res.status(200).json({ count,totalPages: Math.ceil(count / pageSize), summaries,invoices,globalSums });
};

export const report_filter_options = async (req, res) => {

  const [
    branches,
    doctors,
    departments,
    procedures,
    paymentMethods,
    employees, 
    visitorTypes,
    patientTypes,
    gst
  ] = await Promise.all([
    Branch.find({status:true,isApproved:true},{securityCredentials:0}),
    Doctor.find({status:true,isApproved:true}),
    Department.find({status:true,isApproved:true}).populate('BranchID').sort('BranchID'),
    Procedure.find({status:true,isApproved:true}).populate('DepartmentID').populate('BranchID').sort('DepartmentID'),
    PaymentMethod.find({status:true,isApproved:true}),
    Employee.find({status:true,isApproved:true},{securityCredentials:0}),
    VisitorType.find({status:true,isApproved:true}),
    PatientType.find({status:true,isApproved:true}), 
    Procedure.aggregate([{'$group': {'_id': '$GST'}}])
  ]);

  res.status(200).json({
    branches,
    doctors,
    departments,
    procedures,
    paymentMethods,
    employees, 
    visitorTypes,
    patientTypes,
    gst
  });

};
