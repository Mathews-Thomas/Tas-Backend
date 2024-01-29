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
  const { name, permissions, roleType } = req.body;
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

  const NewRole = Role.create({ name, permissions, roleType });
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
    createdBy: firstName + " " + lastName,
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
  const { procedure, description, Cost, DepartmentID } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;
  const validationErrors = await validateInputs([
    [procedure, "address", "procedure"],
    [Cost, "price", "Cost"],
    [DepartmentID, "objectID", "DepartmentID"],
    [description, "address", "description"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const newProcedure = {
    procedure,
    description,
    Cost,
    DepartmentID,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved:  true ,
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

  const newDoctor = {
    name,
    age,
    Gender,
    specialization,
    DepartmentID,
    BranchID,
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
  const Departments = await Department.find({status:true,isApproved:true});
  const Branches = await Branch.find({status:true,isApproved:true});
  

  if (!Branches)
    return res
      .status(400)
      .json({ message: "Branches Not added", status: false });
  if (!Departments)
    return res
      .status(400)
      .json({ message: "Departments Not available", status: false });

  return res.status(200).json({ status: true, Branches, Departments });
};
//==============================================================================================
export const get_addOns = async (req, res) => {
  const Departments = await Department.find({status:true,isApproved:true});
  const Branches = await Branch.find({status:true,isApproved:true});
  const roleType = await Role.find();

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
    Branch.find(),
    PaymentMethod.find(),
    Procedure.find(),
    Department.find(),
    VisitorType.find(),
    PatientType.find(),
  ]);

  const [
    Branches,
    PaymentMethods,
    procedures,
    departments,
    VisitorTypes,
    PatientTypes,
  ] = results;
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
  const Departments = departments.map((dept) => ({
    ...dept.toObject({ virtuals: true }),
    BranchName: branchMap[dept.BranchID],
  }));

  const Procedures = procedures.map((proc) => ({
    ...proc.toObject({ virtuals: true }),
    DepartmentName: DepartmentMap[proc.DepartmentID],
  }));

  return res.status(200).json({
    status: true,
    Branches,
    PaymentMethods,
    Procedures,
    Departments,
    VisitorTypes,
    PatientTypes,
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
  const {id,status} = req.body
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne({ _id: id }, { $set: { status: status } });
 
  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({message:collectionName+"updated Succussfully",updatedDocument});
 
};
//==============================================================================================
export const approve = async (req, res) => {
  const {id} = req.body
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne({ _id: id }, { $set: { isApproved:true} });
 
  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({message:collectionName+"updated Succussfully",updatedDocument});
 
};

//==============================================================================================
export const set_alert = async (req,res) =>{ 
  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;
  const {msg,type,endDate,startDate,BranchID}=req.body
  const validationErrors = await validateInputs ([
   [msg,"address","Message"],
   [type,"name","Type"],
   [BranchID,"BranchID","BranchID"],
  ])
  if (Object.keys(validationErrors).length > 0)
   return res.status(400).json({ errors: validationErrors });

   const newAlert ={
    msg,
    type,
    startDate,
    endDate,
    BranchID,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
   }

   Alert.create(newAlert).then((resp)=>{
    return res.status(200).json({message:`New Message Added`,resp}) 
   }).catch((err)=>{ 
    return res.status(400).json(err)
   })

 }
 //==============================================================================================