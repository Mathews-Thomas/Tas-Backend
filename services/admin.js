import Branch from "../models/BranchSchema.js";
import Employee from "../models/EmployeeSchema.js";
import Role from "../models/RoleSchema.js";
import { validateInputs } from "../validation/validate.js";
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
import mongoose, { isValidObjectId } from "mongoose";
import MainDepartment from "../models/HeadDepartmentSchema.js";
import Patient from "../models/PatientSchema.js";
import Appointment from "../models/AppointmentSchema.js";
import Medicine from "../models/MedicineSchema.js";

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
  MainDepartment,
};

const convertToIST = async (Date) => {
  return moment(Date).tz("Asia/Kolkata").format("DD/MM/YYYY");
};
//=========================================================================================

export const user_details = async (req, res) => {
  let user = req.verifiedUser;
  user = JSON.parse(JSON.stringify(user));
  delete user.securityCredentials;

  res.status(200).json({ user });
};
//=========================================================================================

// employee
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
    return res.status(400).json({ error: "Username Already Exists" });

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
    createdBy: req?.verifiedUser?.firstName + " " + req?.verifiedUser?.lastName,
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
    .json({ message: "Employee Registered Successfully", EmpData });
};
//=========================================================================================
export const EmployeeEdit = async (req, res) => {
  const {
    _id,
    firstName,
    lastName,
    email,
    phone,
    designation,
    age,
    Gender,
    address,
  } = req.body;
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  const validationErrors = await validateInputs([
    [firstName, "name", "firstName"],
    [lastName, "name", "lastName"],
    [email, "email", "email"],
    [phone, "phone", "phone"],
    [designation, "name", "designation"],
    [age, "age", "Age"],
    [Gender, "Gender", "gender"],
    [address, "address", "Address"],
  ]);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }
  const editedEmployee = {
    firstName,
    lastName,
    email,
    phone,
    designation,
    age,
    Gender,
    createdBy: req?.verifiedUser?.firstName + " " + req?.verifiedUser?.lastName,
    address,
  };

  if (!Model) {
    return res.status(404).send("Collection Not Found");
  }

  const updatedDocument = await Model.updateOne(
    { _id },
    { $set: editedEmployee }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document Not Found");
  }
  res.status(200).json({
    message: "Employee Updated Successfully",
    updatedDocument,
  });
};
//=========================================================================================

// Branch
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
//=========================================================================================
export const BranchEdit = async (req, res) => {
  const {
    _id,
    branchName,
    address,
    city,
    state,
    country,
    pincode,
    phone,
    email,
  } = req.body;
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  const validationErrors = await validateInputs([
    [branchName, "name", "branchName"],
    [address, "address", "address"],
    [city, "name", "city"],
    [state, "name", "state"],
    [country, "name", "country"],
    [pincode, "zip", "pincode"],
    [phone, "phone", "Phone Number"],
    [email, "email", "email"],
  ]);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const editedBranch = {
    branchName,
    address,
    city,
    state,
    country,
    pincode,
    phone,
    email,
  };

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne(
    { _id },
    { $set: editedBranch }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: "Branch updated successfully",
    updatedDocument,
  });
};
//=========================================================================================
export const get_Branches = async (req, res) => {
  const Branches = await Branch.find(
    { status: true, isApproved: true },
    { securityCredentials: 0 }
  );

  if (!Branches)
    return res
      .status(400)
      .json({ message: "Branches Not added", status: false });
  return res.status(200).json({ status: true, Branches });
};
//=========================================================================================

// Role
export const AddRole = async (req, res) => {
  const { name, permissions, roleType, createdBy } = req.body;
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

  const NewRole = Role.create({ name, permissions, roleType, createdBy });
  return res.status(200).json(NewRole);
};
//=========================================================================================

//Department
export const addDepartment = async (req, res) => {
  const { Name, BranchID, MainDepartmentID } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([
    [Name, "name", "Department Name"],
    [BranchID, "objectID", "Branch"],
    [MainDepartmentID, "objectID", "MainDepartment"],
  ]);
  const Role = req?.verifiedUser?.role?.roleType;
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  let newDepartment = {
    Name,
    BranchID,
    MainDepartmentID,
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
    .then(async (data) => {
      try {
        await MainDepartment.updateOne(
          { _id: MainDepartmentID },
          { $push: { departments: data._id } }
        );
        res
          .status(200)
          .json({ message: "New Department created successfully", data });
      } catch (updateError) {
        res.status(500).json({
          message: "Failed to update MainDepartment",
          error: updateError,
        });
      }
    })
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//=========================================================================================
export const departmntEdit = async (req, res) => {
  const { _id, Name, MainDepartmentID } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const validationErrors = await validateInputs([
    [Name, "name", "Department Name"],
    [MainDepartmentID, "objectID", "MainDepartment"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const OldDeprtment = await Department.findById(_id);

  const editedDepartment = {
    Name,
    MainDepartmentID,
  };

  Model.findByIdAndUpdate(
    { _id },
    { $set: editedDepartment },
    { new: true }
  ).then(async (resp) => {
    if (
      !(
        OldDeprtment.MainDepartmentID.toString() ===
        resp.MainDepartmentID.toString()
      )
    ) {
      await MainDepartment.updateOne(
        { _id: OldDeprtment.MainDepartmentID },
        { $pull: { departments: resp._id } }
      );
      await MainDepartment.updateOne(
        { _id: resp.MainDepartmentID },
        { $push: { departments: resp._id } }
      );
    }
    res.status(200).json({
      message: collectionName + "updated Succussfully",
      updatedDocument: resp,
    });
  });
};
//=========================================================================================

//Head Department
export const addMainDepartment = async (req, res) => {
  const { Name, BranchID } = req.body;
  const { firstName, lastName } = req.verifiedUser;
  const validationErrors = await validateInputs([
    [Name, "name", "Department Name"],
    [BranchID, "objectID", "Branch"],
  ]);
  const Role = req?.verifiedUser?.role?.roleType;
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  let newMainDepartment = {
    Name,
    BranchID,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

  const DepartmentExist = await MainDepartment.findOne({
    Name: new RegExp(`^${Name}$`, "i"),
    BranchID: BranchID,
  });

  if (DepartmentExist)
    return res
      .status(400)
      .json({ errors: "Department Name is already existed" });

  MainDepartment.create(newMainDepartment)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New Main Department created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//=========================================================================================
export const viewMainDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const mainDepartment = await MainDepartment.findById(id);

    if (!mainDepartment) {
      return res.status(404).send("Main Department not found");
    }

    // Fetch each department individually
    const departmentIds = mainDepartment.departments.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const departments = await Department.find({
      _id: { $in: departmentIds },
    }).populate("BranchID");

    // Combine the results into one object
    const result = {
      ...mainDepartment.toObject(), // Convert document to plain object
      departments: departments,
    };

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching main department data", error });
  }
};
//=========================================================================================
export const edit_MainDepartment = async (req, res) => {
  const { _id, Name, BranchID } = req.body;

  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;

  const validationErrors = await validateInputs([
    [Name, "name", "Name"],
    [BranchID, "objectID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const DepartmentExist = await MainDepartment.findOne({
    Name: new RegExp(`^${Name}$`, "i"),
    BranchID: BranchID,
    _id: { $ne: _id },
  });

  if (DepartmentExist)
    return res
      .status(400)
      .json({ errors: "Department Name is already existed" });

  let updateMainDepartment = {
    Name,
    BranchID,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

  try {
    const updatedMainDepartment = await MainDepartment.findByIdAndUpdate(
      _id,
      updateMainDepartment,
      { new: true } // Option to return the document after update
    );

    if (!updatedMainDepartment) {
      return res.status(404).json({ message: "MainDepartment not found" });
    }

    res.status(200).json({
      message: "MainDepartment updated successfully",
      updatedMainDepartment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating MainDepartment", error });
  }
};
//=========================================================================================

//Patient Type
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
//=========================================================================================

// Visitor Type
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
//=========================================================================================

//Payment Method
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
//=========================================================================================
export const PaymentMethodEdit = async (req, res) => {
  const { _id, Method } = req.body;
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }
  const validationErrors = await validateInputs([[Method, "name", "Method"]]);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const editedPaymentMethod = { Method };

  const updatedDocument = await Model.updateOne(
    { _id },
    { $set: editedPaymentMethod }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: "Payment method updated successfully",
    updatedDocument,
  });
};
//=========================================================================================

//Procedure
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
//=========================================================================================
export const ProcedureEdit = async (req, res) => {
  const { _id, procedure, description, gstOption, HSNCode, GST } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const validationErrors = await validateInputs([
    [procedure, "address", "procedure"],
    [description, "address", "description"],
    [gstOption === "non-exception" && [GST, "GST", "GST"]],
    [HSNCode, "name", "HSNCode"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const editedProcedure = {
    procedure,
    description,
    gstOption,
    HSNCode,
    GST: gstOption === "non-exception" && GST ? GST : 0,
  };

  const updatedDocument = await Model.updateOne(
    { _id },
    { $set: editedProcedure }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: collectionName + "updated Succussfully",
    updatedDocument,
  });
};
//=========================================================================================

// Doctor
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
    ProcedureIds,
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
    procedureIds: [...ProcedureIds],
    phone,
    email,
    address,
    createdBy: firstName + " " + lastName,
    status: Role === "admin" ? true : false,
    isApproved: Role === "admin" ? true : false,
  };

  const DoctorExists = await Doctor.findOne({
    name: new RegExp("^" + name.trim() + "$", "i"),
    BranchID,
  });
  if (DoctorExists)
    return res.status(400).json({ error: "Doctor already exists" });
  Doctor.create(newDoctor)
    .then((data) =>
      res.status(200).json({ message: "New Doctor Added successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//=========================================================================================
export const Get_add_doctor = async (req, res) => {
  const Departments = await Department.find({
    status: true,
    isApproved: true,
  })
    .populate("BranchID")
    .sort({ BranchID: 1 });
  const Branches = await Branch.find(
    { status: true, isApproved: true },
    { securityCredentials: 0 }
  );
  const Procedures = await Procedure.find({ status: true, isApproved: true })
    .populate("BranchID")
    .sort({ BranchID: 1 });
  const Roles = await Role.find({ status: true });

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

  return res
    .status(200)
    .json({ status: true, Branches, Departments, Procedures, Roles });
};
//=========================================================================================
export const list_doctors = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const BranchID = req.query.BranchID;

  const searchQuery = req.query.search
    ? {
        // Assuming you want to search by doctor's name and specialization, adjust as needed
        $or: [
          { name: new RegExp(req.query.search, "i") }, // 'i' for case-insensitive
          { specialization: new RegExp(req.query.search, "i") },
        ],
      }
    : {};

  try {
    // Fetch branches and departments without pagination
    const branchesPromise = Branch.find();
    const departmentsPromise = Department.find();

    if (BranchID) {
      searchQuery.BranchID = BranchID;
    }

    // Apply pagination only to the Doctor.find() query
    const doctorsPromise = Doctor.find(searchQuery)
      .populate({ path: "procedureIds", select: "procedure _id" })
      .skip(skip)
      .limit(limit);

    // Fetch the total count of doctors for pagination info
    const countPromise = Doctor.countDocuments(searchQuery);

    const [Branches, departments, doctors, totalDoctors] = await Promise.all([
      branchesPromise,
      departmentsPromise,
      doctorsPromise,
      countPromise,
    ]);

    const branchMap = Branches.reduce((map, branch) => {
      map[branch._id] = branch.branchName;
      return map;
    }, {});

    const DepartmentMap = departments.reduce((map, departmnt) => {
      map[departmnt._id] = departmnt.Name;
      return map;
    }, {});

    const Doctors = doctors.map((dr) => ({
      ...dr.toObject({ virtuals: true }),
      BranchName: branchMap[dr.BranchID],
      DepartmentName: DepartmentMap[dr.DepartmentID],
    }));

    return res.status(200).json({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
      totalDoctors,
      limit,
      Doctors,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching the doctors list.",
      error: error.message,
    });
  }
};
//=========================================================================================
export const editDoctor = async (req, res) => {
  const {
    _id,
    name,
    age,
    Gender,
    specialization,
    phone,
    email,
    BranchID,
    DepartmentID,
    address,
    procedureIds,
  } = req.body;

  const { firstName, lastName } = req.verifiedUser;
  const Role = req?.verifiedUser?.role?.roleType;

  const validationErrors = await validateInputs([
    [name, "name", "Name"],
    [age, "age", "Age"],
    [Gender, "gender", "Gender"],
    [specialization, "address", "Specialization"],
    [phone, "phone", "Phone"],
    [email, "email", "Email"],
    [address, "address", "Address"],
    [DepartmentID, "objectID", "DepartmentID"],
    [BranchID, "objectID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const updateDoctor = {
    name,
    age,
    Gender,
    specialization,
    DepartmentID,
    BranchID,
    procedureIds: [...procedureIds],
    phone,
    email,
    address,
  };

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      _id,
      updateDoctor,
      { new: true } // Option to return the document after update
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res
      .status(200)
      .json({ message: "Doctor updated successfully", updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor", error });
  }
};
//=========================================================================================

//Add Ons
export const edit_Add_Ons = async (req, res) => {
  const BranchID = req.query.BranchID || " ";
  let branchId = {};
  if (isValidObjectId(BranchID)) {
    branchId.BranchID = new mongoose.Types.ObjectId(BranchID);
  }

  const Departments = await Department.find({
    status: true,
    isApproved: true,
  })
    .populate("BranchID")
    .sort({ BranchID: 1 });
  const MainDepartments = await MainDepartment.find({
    status: true,
    isApproved: true,
  }).populate("BranchID");
  const Branches = await Branch.find(
    { status: true, isApproved: true },
    { securityCredentials: 0 }
  );
  const Procedures = await Procedure.find({
    status: true,
    isApproved: true,
    ...branchId,
  })
    .populate("BranchID")
    .sort({ BranchID: 1 });
  const Roles = await Role.find({ status: true });

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

  return res.status(200).json({
    status: true,
    Branches,
    Departments,
    Procedures,
    Roles,
    MainDepartments,
  });
};
//=========================================================================================
export const get_addOns = async (req, res) => {
  const Departments = await Department.find({
    status: true,
    isApproved: true,
  }).populate("BranchID");
  const Branches = await Branch.find(
    { status: true, isApproved: true },
    { securityCredentials: 0 }
  );
  const roleType = await Role.find({ status: true });
  const MainDepartments = await MainDepartment.find({
    status: true,
    isApproved: true,
  }).populate("BranchID");

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
    .json({ status: true, Branches, Departments, roleType, MainDepartments });
};
//=========================================================================================
export const list_addOns = async (req, res) => {
  const { BranchID } = req.query;
  const Role = req?.verifiedUser?.role?.roleType;
  const results = await Promise.all([
    Branch.find({}, { securityCredentials: 0 }).sort({ createdAt: -1 }),
    Employee.find({}, { securityCredentials: 0 }).sort({ createdAt: -1 }),
    PaymentMethod.find().sort({ createdAt: -1 }),
    Procedure.find(Role === "user" ? { BranchID } : {}).sort({ createdAt: -1 }),
    Department.find(Role === "user" ? { BranchID } : {}).sort({
      createdAt: -1,
    }),
    VisitorType.find().sort({ createdAt: -1 }),
    PatientType.find().sort({ createdAt: -1 }),
    Alert.find().sort({ createdAt: -1 }),
    MainDepartment.find(Role === "user" ? { BranchID } : {}).sort({
      createdAt: -1,
    }),
  ]);

  const [
    Branches,
    Employees,
    PaymentMethods,
    procedures,
    departments,
    VisitorTypes,
    PatientTypes,
    alerts,
    mainDepartment,
  ] = results;

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

  const Main_Department = mainDepartment.map((maindpt) => ({
    ...maindpt.toObject({ virtuals: true }),
    BranchName: branchMap[maindpt.BranchID],
  }));

  return res.status(200).json({
    status: true,
    Branches,
    "Payment Methods": PaymentMethods,
    Procedures,
    Departments,
    "Visitor Types": VisitorTypes,
    "Patient Types": PatientTypes,
    Alerts,
    Employees,
    "Main Department": Main_Department,
  });
};
//=========================================================================================

// Tools
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
//=========================================================================================
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
    { $set: { isApproved: true, status: true } }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: collectionName + "updated Succussfully",
    updatedDocument,
  });
};
//=========================================================================================
export const Edit = async (req, res) => {
  const { _id, type, description } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const validationErrors = await validateInputs([
    [type, "name", "type"],
    [description, "address", "description"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const data = {
    type,
    description,
  };
  const updatedDocument = await Model.updateOne({ _id }, { $set: data });

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: collectionName + "updated Succussfully",
    updatedDocument,
  });
};
//=========================================================================================

//Alerts
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
//=========================================================================================
export const AlertEdit = async (req, res) => {
  const { _id, msg, type, startDate, endDate } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  const validationErrors = await validateInputs([
    [msg, "address", "Message"],
    [type, "name", "Type"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const EditedAlert = {
    msg,
    type,
    startDate,
    endDate,
  };

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne({ _id }, { $set: EditedAlert });

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: collectionName + "updated Succussfully",
    updatedDocument,
  });
};
//=========================================================================================

// Task
export const updatetaskStatus = async (req, res) => {
  try {
    const employeeId = req?.verifiedUser?.id;
    const { taskId, status } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const task = employee.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.status = status;

    await employee.save();

    res
      .status(200)
      .json({ message: "Task status updated successfully", updatedTask: task });
  } catch (error) {
    console.error("Failed to update task status:", error);
    res.status(500).json({ error: "Failed to update task status" });
  }
};
//=========================================================================================
export const edit_task = async (req, res) => {
  try {
    const employeeId = req?.verifiedUser?.id;

    const { taskId, description } = req.body;

    const employee = await Employee.findById(employeeId, {
      securityCredentials: 0,
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const taskIndex = employee.tasks.findIndex((task) => {
      return task.id === taskId;
    });

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    employee.tasks[taskIndex].description = description;
    await employee.save();

    res.status(200).json({ message: "Task updated successfully", employee });
  } catch (error) {
    console.error("Failed to update task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};
//=========================================================================================
export const set_task = async (req, res) => {
  try {
    const { task } = req.body;
    const employeeId = req?.verifiedUser?.id;

    if (!employeeId || !task) {
      return res
        .status(400)
        .send("Missing task details or unable to verify employee ID");
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { $push: { tasks: { $each: [task], $position: 0 } } },
      { new: true, safe: true, upsert: false }
    );

    if (!updatedEmployee) {
      return res.status(404).send("Employee not found");
    }
    const { securityCredentials: _, ...emp } = updatedEmployee.toObject();
    res.json({
      success: true,
      message: "Task added successfully",
      emp,
    });
  } catch (error) {
    console.error("Error adding task to employee:", error);
    res.status(500).send("Internal server error");
  }
};
//=========================================================================================
export const delete_task = async (req, res) => {
  const employeeId = req?.verifiedUser?.id;
  const { taskId } = req.body;

  try {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    employee.tasks.pull(taskId);

    await employee.save();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Failed to delete task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
//=========================================================================================
export const get_task = async (req, res) => {
  const employeeId = req?.verifiedUser?.id;

  if (!employeeId) {
    return res.status(401).send("Unauthorized: No employee ID provided");
  }

  const employeeWithTasks = await Employee.findById(employeeId)
    .select("tasks")
    .exec();

  if (!employeeWithTasks) {
    return res.status(404).send("Employee not found");
  }

  res.json({ tasks: employeeWithTasks.tasks });
};
//=========================================================================================

// Reports
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
    now.getFullYear() - 1,
    now.getMonth(),
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
  if (BranchID)
    matchFilters["BranchID"] = new mongoose.Types.ObjectId(BranchID);
  if (doctorID)
    matchFilters["doctorID"] = new mongoose.Types.ObjectId(doctorID);
  if (DepartmentID)
    matchFilters["DepartmentID"] = new mongoose.Types.ObjectId(DepartmentID);
  if (ProcedureID && ProcedureID.length) {
    matchFilters["items.ProcedureID"] = {
      $in: ProcedureID.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }
  if (GST) matchFilters["items.GST"] = Number(GST);
  if (paymentMethod)
    matchFilters["paymentMethod.paymentMethodID"] = new mongoose.Types.ObjectId(
      paymentMethod
    );
  if (createdBy)
    matchFilters["createdBy"] = { $regex: new RegExp(createdBy, "i") };

  const patientInfoFilters = {};
  if (visitorTypeId)
    patientInfoFilters["patientInfo.VisitorTypeID"] =
      new mongoose.Types.ObjectId(visitorTypeId);
  if (patientTypeId)
    patientInfoFilters["patientInfo.patientTypeID"] =
      new mongoose.Types.ObjectId(patientTypeId);
  if (Gender) patientInfoFilters["patientInfo.Gender"] = Gender;
  if (StartAge && EndAge) {
    patientInfoFilters["patientInfo.age"] = {
      $gte: parseInt(StartAge, 10),
      $lte: parseInt(EndAge, 10),
    };
  }
  let itemsMatchConditions = {};

  if (ProcedureID && ProcedureID.length) {
    matchFilters["items.ProcedureID"] = {
      $in: ProcedureID.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }
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
    ...(Object.keys(patientInfoFilters).length > 0
      ? [{ $match: patientInfoFilters }]
      : []),
    {
      $facet: {
        total: [{ $count: "count" }],
        invoices: [
          { $skip: (Number(page) - 1) * Number(pageSize) },
          { $limit: Number(pageSize) },
        ],
        summaries: [
          { $unwind: "$items" },
          { $match: itemsMatchConditions },
          {
            $group: {
              _id: "$items.GST",
              totalAmountToBePaid: { $sum: "$items.amountToBePaid" },
              totalGstAmount: { $sum: "$items.gstAmount" },
              totalBaseAmount: { $sum: "$items.baseAmount" },
              totalCount: { $sum: 1 },
            },
          },
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
      },
    },
  ];

  // Execute the total calculation pipeline
  const results = await PatientInvoice.aggregate(totalPipeline);
  const count =
    results.length > 0 && results[0].total.length > 0
      ? results[0].total[0].count
      : 0;
  const invoices = results.length > 0 ? results[0].invoices : [];
  const summaries = results.length > 0 ? results[0].summaries : [];
  const globalSums = results.length > 0 ? results[0].globalSums[0] : [];

  return res.status(200).json({
    count,
    totalPages: Math.ceil(count / pageSize),
    summaries,
    invoices,
    globalSums,
  });
};
//=========================================================================================
export const report_filter_options = async (req, res) => {
  const { BranchID } = req.query;

  let branchFilter = { status: true, isApproved: true };
  let customFilter = {};

  if (BranchID && BranchID !== "undefined") {
    branchFilter._id = BranchID;
    customFilter.BranchID = BranchID;
  }

  const [
    branches,
    doctors,
    departments,
    procedures,
    paymentMethods,
    employees,
    visitorTypes,
    patientTypes,
    gst,
  ] = await Promise.all([
    Branch.find(branchFilter, { securityCredentials: 0 }),
    Doctor.find({ ...customFilter, status: true, isApproved: true }),
    Department.find({ ...customFilter, status: true, isApproved: true })
      .populate("BranchID")
      .sort("BranchID"),
    Procedure.find({ ...customFilter, status: true, isApproved: true })
      .populate("DepartmentID")
      .populate("BranchID")
      .sort("DepartmentID"),
    PaymentMethod.find({ status: true, isApproved: true }),
    Employee.find(
      { status: true, isApproved: true },
      { securityCredentials: 0 }
    ),
    VisitorType.find({ status: true, isApproved: true }),
    PatientType.find({ status: true, isApproved: true }),
    Procedure.aggregate([{ $group: { _id: "$GST" } }]),
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
    gst,
  });
};
//=========================================================================================
export const adminhome_reports = async (req, res) => {
  const { BranchID } = req.query;

  try {
    const day = new Date();

    const startOfDay = moment(day).tz("Asia/Kolkata").startOf("day").toDate();
    const endOfDay = moment(startOfDay)
      .tz("Asia/Kolkata")
      .endOf("day")
      .toDate();

    const invoiceAggregationPipeline = [
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          todaysInvoice: { $sum: 1 },
          todaysCollections: { $sum: "$amountToBePaid" },
          todaysPatients: { $addToSet: "$patientID" },
        },
      },
    ];

    if (isValidObjectId(BranchID)) {
      invoiceAggregationPipeline.unshift({
        $match: {
          BranchID: new mongoose.Types.ObjectId(BranchID),
        },
      });
    }

    const invoiceResult = await PatientInvoice.aggregate(
      invoiceAggregationPipeline
    );

    const doctorAggregationPipeline = [
      {
        $lookup: {
          from: "branches",
          localField: "BranchID",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $unwind: "$branch",
      },
      {
        $lookup: {
          from: "patientinvoices",
          localField: "_id",
          foreignField: "doctorID",
          as: "invoices",
        },
      },
      {
        $unwind: { path: "$invoices", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$_id",
          department: { $first: "$specialization" },
          name: { $first: "$name" },
          branch: { $first: "$branch.branchName" },
          totalCollection: { $sum: "$invoices.amountToBePaid" },
          firstInvoiceCreatedAt: {
            $min: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$invoices.createdAt",
              },
            },
          },
          lastInvoiceCreatedAt: {
            $max: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$invoices.createdAt",
              },
            },
          },
        },
      },
      {
        $sort: { totalCollection: -1 },
      },
    ];

    const doctorsResult = await Doctor.aggregate(doctorAggregationPipeline);

    const procedureAggregationPipeline = [
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorID",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
      },
      {
        $lookup: {
          from: "branches",
          localField: "doctor.BranchID",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $unwind: "$branch",
      },
      {
        $lookup: {
          from: "departments",
          localField: "doctor.DepartmentID",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$department",
      },
      {
        $group: {
          _id: "$items.ProcedureID",
          procedure: { $first: "$items.procedure" },
          branch: { $first: "$branch.branchName" },
          department: { $first: "$department.Name" },
          totalCount: { $sum: "$items.quantity" },
        },
      },
      {
        $sort: { totalCount: -1 },
      },
    ];

    const procedureResult = await PatientInvoice.aggregate(
      procedureAggregationPipeline
    );

    const employeeResult = await Employee.find({}, { securityCredentials: 0 });

    res.json({
      todaysInvoice:
        invoiceResult.length > 0 ? invoiceResult[0].todaysInvoice : 0,
      todaysCollections:
        invoiceResult.length > 0 ? invoiceResult[0].todaysCollections : 0,
      todaysPatientsCount:
        invoiceResult.length > 0 ? invoiceResult[0].todaysPatients.length : 0,
      doctors: doctorsResult,
      procedures: procedureResult,
      employee: employeeResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
//=========================================================================================
export const consolidated_reports = async (req, res) => {
  const { BranchID, StartDate, EndDate } = req.query;
  const timezone = "Asia/Kolkata";
  try {
    const day = new Date();
    const todayStart = moment(day).tz(timezone).startOf("day").toDate();
    const todayEnd = moment(todayStart).tz(timezone).endOf("day").toDate();

    const currentMoment = moment.tz(timezone); // Calculate "this month" start
    const thisMonthStart = StartDate
      ? moment(StartDate).startOf("day").toDate()
      : currentMoment.clone().startOf("month").toDate();
    const thisMonthEnd = EndDate
      ? moment(EndDate).endOf("day").toDate()
      : currentMoment.clone().endOf("month").toDate();

    const extPipline = [
      {
        $lookup: {
          from: "departments",
          localField: "DepartmentID",
          foreignField: "_id",
          as: "departmentInfo",
        },
      },
      {
        $unwind: "$departmentInfo",
      },
      {
        $lookup: {
          from: "maindepartments",
          localField: "departmentInfo._id",
          foreignField: "departments",
          as: "mainDepartmentInfo",
        },
      },
      {
        $unwind: "$mainDepartmentInfo",
      },
      {
        $lookup: {
          from: "branches",
          localField: "mainDepartmentInfo.BranchID",
          foreignField: "_id",
          as: "branchInfo",
        },
      },
      {
        $unwind: "$branchInfo",
      },
      {
        $group: {
          _id: {
            branchId: "$branchInfo._id",
            mainDepartmentId: "$mainDepartmentInfo._id",
            departmentId: "$departmentInfo._id",
          },
          branchName: { $first: "$branchInfo.branchName" },
          mainDepartmentName: { $first: "$mainDepartmentInfo.Name" },
          departmentName: { $first: "$departmentInfo.Name" },
          departmentSum: { $sum: "$amountToBePaid" },
          departmentInvoiceCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            branchId: "$_id.branchId",
            mainDepartmentId: "$_id.mainDepartmentId",
          },
          branchName: { $first: "$branchName" },
          mainDepartmentName: { $first: "$mainDepartmentName" },
          mainDepartmentSum: { $sum: "$departmentSum" },
          mainDepartmentInvoiceCount: { $sum: "$departmentInvoiceCount" },
          departments: {
            $push: {
              departmentId: "$_id.departmentId",
              departmentName: "$departmentName",
              departmentSum: "$departmentSum",
              departmentInvoiceCount: "$departmentInvoiceCount",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.branchId",
          branchName: { $first: "$branchName" },
          branchSum: { $sum: "$mainDepartmentSum" },
          branchInvoiceCount: { $sum: "$mainDepartmentInvoiceCount" },
          mainDepartments: {
            $push: {
              mainDepartmentId: "$_id.mainDepartmentId",
              mainDepartmentName: "$mainDepartmentName",
              mainDepartmentSum: "$mainDepartmentSum",
              mainDepartmentInvoiceCount: "$mainDepartmentInvoiceCount",
              departments: "$departments",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          branchId: "$_id",
          branchName: 1,
          branchSum: 1,
          branchInvoiceCount: 1,
          mainDepartments: 1,
        },
      },
    ];

    let matchAsOfLastMonth = {
      createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
    };

    if (isValidObjectId(BranchID)) {
      matchAsOfLastMonth["BranchID"] = new mongoose.Types.ObjectId(BranchID);
    }
    let matchtoday = {
      createdAt: { $gte: todayStart, $lte: todayEnd },
    };

    if (isValidObjectId(BranchID)) {
      matchtoday["BranchID"] = new mongoose.Types.ObjectId(BranchID);
    }

    const data = await PatientInvoice.aggregate([
      {
        $facet: {
          today: [{ $match: matchtoday }, ...extPipline],
          asOfLastMonth: [{ $match: matchAsOfLastMonth }, ...extPipline],
        },
      },
    ]);

    const doctorsMatch = {
      createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
    };
    if (isValidObjectId(BranchID)) {
      doctorsMatch["BranchID"] = new mongoose.Types.ObjectId(BranchID);
    }

    const doctorsResult = await PatientInvoice.aggregate([
      {
        $match: doctorsMatch,
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctorID",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: {
          path: "$doctorInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: {
            doctorName: "$doctorInfo.name",
            procedure: "$items.procedure",
            branchId: "$BranchID",
          },
          totalInvoiceSum: { $sum: "$items.amountToBePaid" },
          procedureCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.doctorName": 1,
          totalInvoiceSum: -1,
        },
      },
      {
        $project: {
          _id: 0,
          doctorName: "$_id.doctorName",
          procedure: "$_id.procedure",
          branchId: "$_id.branchId",
          totalInvoiceSum: 1,
          procedureCount: 1,
        },
      },
    ]);

    const branches = await Branch.find({}, { _id: 1, branchName: 1 });

    const date = {
      todayStartData: await convertToIST(todayStart),
      todayEndDate: await convertToIST(todayEnd),
      lastMonthStart: await convertToIST(thisMonthStart),
      lastMonthEnd: await convertToIST(thisMonthEnd),
    };
    res.status(200).json({
      today: data[0].today,
      asOfLastMonth: data[0].asOfLastMonth,
      date,
      DoctorsColloction: doctorsResult,
      branches,
    });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).send("Server error");
  }
};
//=========================================================================================
export const consolidated_progress_reports = async (req, res) => {
  const { BranchID } = req.query;
  const timezone = "Asia/Kolkata";
  const day = new Date();
  // Calculate "today" start and end
  const todayStart = moment(day).tz(timezone).startOf("day").toDate();

  const todayEnd = moment(todayStart).tz(timezone).endOf("day").toDate();

  const currentMoment = moment.tz(timezone);
  // Calculate "this month" start and end
  const thisMonthStart = currentMoment.clone().startOf("month").toDate();

  const thisMonthEnd = currentMoment.clone().endOf("month").toDate();

  const NewPatients = async (startDate, endDate, BranchID = null) => {
    let visitorTypeMatch = { createdAt: { $gte: startDate, $lte: endDate } };
    if (isValidObjectId(BranchID)) {
      visitorTypeMatch["BranchID"] = new mongoose.Types.ObjectId(BranchID);
    }

    return Patient.aggregate([
      {
        $match: visitorTypeMatch,
      },

      {
        $lookup: {
          from: "patientinvoices",
          localField: "_id",
          foreignField: "patientID",
          as: "invoices",
        },
      },
      {
        $unwind: "$invoices",
      },
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$createdAt",
                    },
                  },
                  {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$invoices.createdAt",
                    },
                  },
                ],
              },
            ],
          },
        },
      },

      {
        $lookup: {
          from: "maindepartments",
          localField: "invoices.MainDepartmentID",
          foreignField: "_id",
          as: "maindepartments",
        },
      },
      {
        $unwind: {
          path: "$maindepartments",
        },
      },
      {
        $group: {
          _id: {
            mainDepartment: "$invoices.MainDepartmentID",
            branch: "$BranchID",
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          },
          name: {
            $addToSet: "$Name",
          },
          department: {
            $first: "$maindepartments.Name",
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          mainDepartment: "$_id.mainDepartment",
          branch: "$_id.branch",
          count: "$count",
          name: "$name",
          department: "$department",
        },
      },
      {
        $group: {
          _id: {
            date: "$date",
          },
          count: {
            $sum: 1,
          },
          department: {
            $first: "$department",
          },
        },
      },
    ]);
  };

  const todayResults = await NewPatients(todayStart, todayEnd);
  const thisMonthResults = await NewPatients(thisMonthStart, thisMonthEnd);

  const VisitedUniquePatients = async (startOfMonth, endOfMonth) => {
    const VsitorTypeMatch = {
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    };
    if (isValidObjectId(BranchID)) {
      VsitorTypeMatch["BranchID"] = new mongoose.Types.ObjectId(BranchID);
    }
    return PatientInvoice.aggregate([
      {
        $match: VsitorTypeMatch,
      },
      {
        $addFields: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $group: {
          _id: {
            date: "$date",
            patientID: "$patientID",
            BranchID: "$BranchID",
            department: "$DepartmentID",
          },
        },
      },
      {
        $group: {
          _id: {
            BranchID: "$_id.BranchID",
            department: "$_id.department",
          },
          uniquePatients: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.date": 1, "_id.BranchID": 1, "_id.department": 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          BranchID: "$_id.BranchID",
          department: "$_id.department",
          uniquePatients: 1,
        },
      },
    ]);
  };

  // Use the function for today's visitors
  const todaysVisitors = await VisitedUniquePatients(todayStart, todayEnd);

  // And for this month's visitors
  const thisMonthsVisitors = await VisitedUniquePatients(
    thisMonthStart,
    thisMonthEnd
  );

  const branches = await Branch.find({}, { _id: 1, branchName: 1 });
  const MainDepartments = await MainDepartment.find(
    {},
    { _id: 1, departments: 1, Name: 1, BranchID: 1 }
  );

  const vistorResults = {
    today: todaysVisitors,
    thisMonth: thisMonthsVisitors,
  };

  const results = {
    today: todayResults,
    thisMonth: thisMonthResults,
  };

  const date = {
    todayStartData: await convertToIST(todayStart),
    todayEndDate: await convertToIST(todayEnd),
    lastMonthStart: await convertToIST(thisMonthStart),
    lastMonthEnd: await convertToIST(thisMonthEnd),
  };

  res.status(200).json({
    branches,
    MainDepartments,
    vistorResults,
    results,
    date,
  });
};
//=========================================================================================

// Appointments
export const set_appointment = async (req, res) => {
  const {
    branch_id,
    name,
    phone,
    age,
    place,
    email,
    gender,
    new_patient,
    patient_id,
    date_time,
    doctor_id,
    procedure,
    visit_type,
    note,
  } = req.body;

  const validationErrors = await validateInputs([
    [name, "name", "name"],
    [age, "age", "age"],
    [place, "name", "name"],
    [phone, "phone", "phone"],
    [doctor_id, "objectID", "Doctor ID"],
    [branch_id, "objectID", "BranchID"],
    [date_time, "date", "date and time"],
    [visit_type, "visit", "Visiting Type"],
  ]);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  if (new_patient && !patient_id) {
    const existingPatient = await Patient.findOne({
      BranchID: branch_id,
      Name: name,
      phone,
    });
    if (existingPatient)
      return res.status(400).send({ errors: "Patient already exists." });
  }

  const existingAppointment = await Appointment.findOne({
    doctor_id,
    date_time,
  });
  if (existingAppointment) {
    return res.status(400).json({
      errors:
        "Selected time slot is already taken. Please select another slot.",
    });
  }

  const new_appointment = {
    branch_id: branch_id,
    patient: {
      name: name,
      phone: phone,
      age: age,
      place: place,
      email: email,
      gender: gender,
    },
    new_patient: new_patient,
    patient_id: patient_id,
    date_time: date_time,
    doctor_id: doctor_id,
    procedure_id: procedure,
    visit_type: visit_type,
    note: note,
    status: "scheduled",
    createdBy: req.verifiedUser.firstName + " " + req.verifiedUser.lastName,
  };

  Appointment.create(new_appointment)
    .then((data) =>
      res
        .status(200)
        .json({ message: "New Appointment created successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//=========================================================================================

export const cancel_appointment = async (req, res) => {
  const { _id } = req.query;

  const validationErrors = await validateInputs([
    [_id, "objectID", "Appointment ID"],
  ]);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const not_existingAppointment = await Appointment.findById({ _id });
  if (not_existingAppointment) {
    return res.status(400).json({ errors: "Appointment Not found" });
  }

  const updated_appointment = Appointment.updateOne(
    { _id },
    { $set: { status: "canceled" } }
  );

  res.status(200).json({ message: "New Appointment Cancelled successfully" });
};
//=========================================================================================

// medicine adding
export const add_medicine = async (req, res) => {
  try {
    const {
      medicineName,
      price,
      quantity,
      batchNumber,
      category,
      expirationDate,
      strength,
      branch,
      departments,
    } = req.body;

    if (
      !medicineName ||
      !price ||
      !quantity ||
      !batchNumber ||
      !category ||
      !expirationDate ||
      !strength ||
      !branch ||
      !departments ||
      !Array.isArray(departments) ||
      departments.length === 0
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { firstName, lastName } = req.verifiedUser;
    const Role = req.verifiedUser?.role?.roleType;

    const MedicineExists = await Medicine.findOne({
      medicineName: new RegExp("^" + medicineName.trim() + "$", "i"),
      branch,
      departments: { $in: departments },
    });

    if (MedicineExists) {
      return res.status(400).json({
        error: "Medicine already exists in the same branch and Same department",
      });
    }

    const newMedicine = new Medicine({
      medicineName,
      price,
      quantity,
      batchNumber,
      category,
      expirationDate,
      strength,
      branch,
      departments,
      createdBy: firstName + " " + lastName,
      status: Role === "admin" ? true : false,
    });

    // "branch" :"6620f2ee3d1cc04043a54a6d",
    // "department":"6620f898d067cb8d6252edd5"

    const createdMedicine = await newMedicine.save();
    return res.status(201).json({
      message: "New medicine added successfully",
      data: createdMedicine,
    });
  } catch (error) {
    console.error("Error adding medicine:", error.message, error.stack);
    res.status(500).json({ error: "failed to add medicine" });
  }
};

//=================================================================================================================

// medicine getting

export const get_medicines = async (req, res) => {
  const { page = 1, limit = 10, search, DepartmentID, BranchID } = req.query;

  let filter = {};

  // Filtering by BranchID if provided
  if (BranchID) filter.branch = BranchID;

  // Filtering by DepartmentID if provided
  if (DepartmentID) {
    filter.departments = { $in: [DepartmentID] };
  }


  // If a search term is provided, use it to filter by medicine name
  if (search) {
    filter.medicineName = { $regex: search, $options: "i" };
  }

  const medicines = await Medicine.find(filter)
    .populate("branch") // Populate Branch details
    .populate("departments") // Populate Department details
    .sort({ createdAt: -1 }) // Sort by creation date in descending order
    .limit(limit * 1) // Limit the number of results returned
    .skip((page - 1) * limit) // Skip results for pagination
    .exec();

  const count = await Medicine.countDocuments(filter);

  res.status(200).json({
    medicines,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
};

//=================================================================================================================
