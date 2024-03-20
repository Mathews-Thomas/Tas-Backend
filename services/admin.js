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
  })
    .populate("BranchID")
    .sort({ BranchID: 1 });
  const Branches = await Branch.find({ status: true, isApproved: true });
  const Procedures = await Procedure.find({ status: true, isApproved: true })
    .populate("BranchID")
    .sort({ BranchID: 1 });
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
    .json({ status: true, Branches, Departments, Procedures });
};
//==============================================================================================
export const get_addOns = async (req, res) => {
  const Departments = await Department.find({
    status: true,
    isApproved: true,
  }).populate("BranchID");
  const Branches = await Branch.find({ status: true, isApproved: true });
  const roleType = await Role.find({ status: true });

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
    Employee.find().sort({ createdAt: -1 }),
    PaymentMethod.find().sort({ createdAt: -1 }),
    Procedure.find().sort({ createdAt: -1 }),
    Department.find().sort({ createdAt: -1 }),
    VisitorType.find().sort({ createdAt: -1 }),
    PatientType.find().sort({ createdAt: -1 }),
    Alert.find().sort({ createdAt: -1 }),
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
  return res.status(200).json({
    status: true,
    Branches,
    "Payment Methods":PaymentMethods,
    Procedures,
    Departments,
    "Visitor Types":VisitorTypes,
    "Patient Types":PatientTypes,
    Alerts,
    Employees,
  });
};
//==============================================================================================
export const list_doctors = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

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

    // Apply pagination only to the Doctor.find() query
    const doctorsPromise = Doctor.find(searchQuery)
      .populate({ path: "procedureIds", select: "procedure _id" })
      .skip(skip)
      .limit(limit);

    // Fetch the total count of doctors for pagination info
    const countPromise = Doctor.countDocuments();

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
export const user_details = async (req, res) => {
  let user = req.verifiedUser;
  user = JSON.parse(JSON.stringify(user));
  delete user.securityCredentials;

  res.status(200).json({ user });
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
  if (BranchID)
    matchFilters["BranchID"] = new mongoose.Types.ObjectId(BranchID);
  if (doctorID)
    matchFilters["doctorID"] = new mongoose.Types.ObjectId(doctorID);
  if (DepartmentID)
    matchFilters["DepartmentID"] = new mongoose.Types.ObjectId(DepartmentID);
  if (ProcedureID)
    matchFilters["items.ProcedureID"] = new mongoose.Types.ObjectId(
      ProcedureID
    );
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
  if (ProcedureID)
    itemsMatchConditions["items.ProcedureID"] = new mongoose.Types.ObjectId(
      ProcedureID
    );
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
    gst,
  ] = await Promise.all([
    Branch.find({ status: true, isApproved: true }, { securityCredentials: 0 }),
    Doctor.find({ status: true, isApproved: true }),
    Department.find({ status: true, isApproved: true })
      .populate("BranchID")
      .sort("BranchID"),
    Procedure.find({ status: true, isApproved: true })
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
//==============================================================================================

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
//==============================================================================================

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
//==============================================================================================

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
//==============================================================================================

export const departmntEdit = async (req, res) => {
  const { _id, Name } = req.body;
  const value = req.path.split("/")[1];
  const collectionName = req.path.split("/")[1];
  const Model = models[collectionName];

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const validationErrors = await validateInputs([
    [Name, "name", "Department Name"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const editedDepartment = {
    Name,
  };
  const updatedDocument = await Model.updateOne(
    { _id },
    { $set: editedDepartment }
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
    address,
  };

  if (!Model) {
    return res.status(404).send("Collection not found");
  }

  const updatedDocument = await Model.updateOne(
    { _id },
    { $set: editedEmployee }
  );

  if (updatedDocument.matchedCount === 0) {
    return res.status(404).send("Document not found");
  }
  res.status(200).json({
    message: "Employee updated successfully",
    updatedDocument,
  });
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

    const employee = await Employee.findById(employeeId);

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

    res.json({
      success: true,
      message: "Task added successfully",
      updatedEmployee,
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

//=====================================================================
export const adminhome_reports = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

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
          firstInvoiceCreatedAt: { $min: { $dateToString: { format: "%Y-%m-%d", date: "$invoices.createdAt" } } },
          lastInvoiceCreatedAt: { $max: { $dateToString: { format: "%Y-%m-%d", date: "$invoices.createdAt" } } },
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

    const employeeResult = await Employee.find();

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
