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
import Alert from "../models/AlertSchema.js";
import mongoose from "mongoose";
import Medicine from "../models/MedicineSchema.js";

// Branch
export const branchLogin = async (req, res) => {
  const { loginId, password } = req.body;
  const validationErrors = validateInputs([
    [loginId, "loginId", "loginId"],
    [password, "password", "loginId"],
  ]);
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const branch = await Branch.findOne({
    "securityCredentials.loginId": loginId,
  });
  if (!branch) {
    return res.status(403).json({ error: "Username mismatched" });
  }
  const isPasswordMatch = await bcrypt.compare(
    password,
    branch.securityCredentials.password
  );
  if (!isPasswordMatch) {
    return res.status(403).json({ error: "Password mismatched" });
  }

  const branchData = branch.toObject();
  delete branchData.securityCredentials.password;
  const token = jwtSign(branchData._id.toString());
  return res.status(200).json({ Branch: branchData, token: token });
};
//=========================================================================================
export const get_branch = async (req, res) => {
  const { BranchID } = req.params;
  const validationErrors = await validateInputs([
    [BranchID, "BranchID", "BranchID"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const branch = await Branch.findById(
    { _id: BranchID },
    { securityCredentials: 0 }
  );
  if (!branch) return res.status(404).send("branch not found");

  res.status(200).send(branch);
};
//=========================================================================================

// Employee
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
  if (!employee) return res.status(403).json({ err: "Username mismatched" });
  if (!employee.status || !employee.isApproved)
    return res.status(403).json({
      err: "Access denied. Please contact the administrator.",
    });

  const isPasswordMatch = await bcrypt.compare(
    password,
    employee.securityCredentials.password
  );
  if (!isPasswordMatch)
    return res.status(403).json({ err: "Password mismatched" });

  const employeeData = employee.toObject();
  delete employeeData.securityCredentials.password; // Remove password for security
  const token = jwtSign(employeeData._id.toString());
  return res.status(200).json({ Employee: employeeData, token: token });
};
//=========================================================================================

// Patient
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

  const existingPatient = await Patient.findOne({ BranchID, Name, phone });

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
//=========================================================================================
export const getAddPatient = async (req, res) => {
  const BranchID = req.params.BranchID;
  const VisitorTypes = await VisitorType.find({
    status: true,
    isApproved: true,
  });
  const PatientTypes = await PatientType.find({
    status: true,
    isApproved: true,
  });
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
//=========================================================================================
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
  const patients = await Patient.find({ BranchID, ...filter })
    .populate("VisitorTypeID")
    .populate("patientTypeID")
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
//=========================================================================================
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
    PatientID: PatientID,
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

  await Patient.updateOne({ PatientID }, updatedPatient)
    .then((data) =>
      res.status(200).json({ message: "Patient updated successfully", data })
    )
    .catch((err) => res.status(200).json({ message: "error", err }));
};
//=========================================================================================

// Invoice
export const addInvoice = async (req, res) => {
  const {
    invoiceID,
    MainDepartmentID,
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
    [MainDepartmentID, "objectID", "MainDepartmentID"],
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
    MainDepartmentID: MainDepartmentID,
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

  const includesConsultationFee = items.filter(
    (item) =>
      item.procedure === "Consultation" ||
      item.ProcedureID === "consultationProcedureID"
  );

  PatientInvoice.create(newInvoice)
    .then((resp) => {
      const updateObject = { $push: { Invoices: resp?._id } };
      if (includesConsultationFee && includesConsultationFee.length > 0) {
        (updateObject.$push.consultation = {
          Date: new Date(),
          Amount: includesConsultationFee[0].amountToBePaid,
          invoiceID: resp?._id,
        }),
          (updateObject.lastConsultationFeeDate = new Date());
      }
      const today = new Date();
      const patientCreatedAt = new Date(patient.createdAt);
      const lastConsultationDate = new Date(patient.lastConsultationFeeDate);
      const daysSinceLastConsultation = Math.floor(
        (today - lastConsultationDate) / (1000 * 60 * 60 * 24)
      );
      const visitorTypeUpdate = {};

      if (patientCreatedAt.toDateString() === today.toDateString()) {
        visitorTypeUpdate.VisitorTypeID = "66210e15d067cb8d6252f07a"; // Use the actual ID for "New"
      } else if (daysSinceLastConsultation <= 30) {
        visitorTypeUpdate.VisitorTypeID = "66210e4ad067cb8d6252f087"; // Use the actual ID for "Visit"
      } else {
        visitorTypeUpdate.VisitorTypeID = "66210ea8d067cb8d6252f094"; // Use the actual ID for "Renew"
      }

      Object.assign(updateObject, visitorTypeUpdate);

      Patient.findOneAndUpdate({ _id: patient._id }, updateObject, {
        new: true,
      })
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
//=========================================================================================
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
    Doctor.find({ BranchID, status: true, isApproved: true }).populate(
      "DepartmentID"
    ),
    Patient.findOne({ PatientID })
      .populate("VisitorTypeID")
      .populate("patientTypeID"),
    Procedure.find({ status: true, isApproved: true, BranchID }),
    VisitorType.find({ status: true, isApproved: true }),
    PatientType.find({ status: true, isApproved: true }),
    Branch.findOne(
      { _id: BranchID, isApproved: true },
      { securityCredentials: 0 }
    ),
    PaymentMethod.find({ status: true, isApproved: true }),
  ]);

  if (!branch) return res.status(404).send({ errors: "Branch not found." });

  const PatientInvoiceCount = await PatientInvoice.countDocuments({ BranchID });
  const nextInvoceID = `INV${branch.branchName[0].toUpperCase()}${
    PatientInvoiceCount + 1
  }`;

  // Check for empty results

  if (!Doctors.length) {
    return res.status(404).send({ errors: "Doctors lists are empty." });
  }
  if (!Procedures.length) {
    return res.status(404).send({ errors: "Procedures lists are empty." });
  }
  if (!VisitorTypes.length) {
    return res.status(404).send({ errors: "VisitorTypes lists are empty." });
  }
  if (!PatientTypes.length) {
    return res.status(404).send({ errors: "PatientTypes lists are empty." });
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

  res.status(200).json({
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
//=========================================================================================
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
      ...filter,
      $or: [
        {
          patientID: {
            $in: await Patient.find({
              Name: { $regex: search, $options: "i" },
            }).distinct("_id"),
          },
        },
        {
          doctorID: {
            $in: await Doctor.find({
              name: { $regex: search, $options: "i" },
            }).distinct("_id"),
          },
        },
        {
          invoiceID: { $regex: search, $options: "i" },
        },
      ],
    };
  }
  const patientInvoice = await PatientInvoice.find(filter)
    .populate("doctorID")
    .populate("patientID")
    .populate("DepartmentID")
    .populate({
      path: "items.ProcedureID",
      model: "Procedure",
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
  });
};
//=========================================================================================
export const editInvoice = async (req, res) => {
  const {
    invoiceID,
    MainDepartmentID,

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
    [MainDepartmentID, "objectID", "MainDepartmentID"],
    [patient._id, "objectID", "patientID"],
    [invoiceID, "name", "invoiceID"],
    [totalAmount, "price", "totalAmount"],
    [amountToBePaid, "price", "amountToBePaid"],
    [BranchID, "BranchID", "BranchID"],
  ]);

  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const currentInvoice = await PatientInvoice.findOne({ invoiceID });
  if (!currentInvoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  if (currentInvoice.patientID.toString() !== patient._id) {
    await Patient.findByIdAndUpdate(currentInvoice.patientID, {
      $pull: { Invoices: currentInvoice._id },
    });

    await Patient.findByIdAndUpdate(patient._id, {
      $addToSet: { Invoices: currentInvoice._id },
    });
  }
  const updatedInvoice = await PatientInvoice.updateOne(
    { invoiceID },
    {
      patientID: patient._id,
      doctorID,
      DepartmentID,
      MainDepartmentID: MainDepartmentID,
      paymentMethod: {
        paymentMethod,
        paymentMethodID,
      },
      items,
      totalAmount,
      totalDiscount,
      amountToBePaid,
      createdBy: `${firstName} ${lastName}`,
      BranchID,
      status: true,
    }
  );

  res
    .status(200)
    .json({ message: "Invoice updated successfully", data: updatedInvoice });
};
//=========================================================================================
export const delete_invoice = async (req, res) => {
  const { invoiceID } = req.params;
  try {
    // Find the invoice to get the patientID before deletion
    const invoiceToDelete = await PatientInvoice.findById(invoiceID);
    if (!invoiceToDelete) {
      return res.status(404).send({ message: "Invoice not found" });
    }
    const patientID = invoiceToDelete.patientID;

    // Delete the invoice
    await PatientInvoice.findByIdAndDelete(invoiceID);

    // Remove the invoice ID from the patient's Invoices array
    await Patient.findByIdAndUpdate(patientID, {
      $pull: { Invoices: new mongoose.Types.ObjectId(invoiceID) },
    });

    res.status(200).send({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).send({ message: "Failed to delete invoice" });
  }
};
//=========================================================================================

// Alert
export const get_alert = async (req, res) => {
  const { BranchID } = req.params;
  const validationErrors = await validateInputs([
    [BranchID, "BranchID", "BranchID"],
  ]);
  if (Object.keys(validationErrors).length > 0)
    return res.status(400).json({ errors: validationErrors });

  const today = new Date();
  const alerts = await Alert.find({
    status: true,
    BranchID,
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  if (!alerts) return res.status(404).send("Document not found");

  res.status(200).send(alerts);
};

//=========================================================================================

// patient fetching with patient id

export const getPatientDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch patient details
    const patient = await Patient.findOne({ PatientID: id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Aggregate invoice and doctor details
    const result = await Patient.aggregate([
      { $match: { PatientID: id } },
      {
        $lookup: {
          from: "patientinvoices",
          localField: "_id",
          foreignField: "patientID",
          as: "result",
        },
      },
      { $unwind: "$result" },
      {
        $lookup: {
          from: "doctors",
          localField: "result.doctorID",
          foreignField: "_id",
          as: "doctorname",
        },
      },
      {
        $group: {
          _id: "$_id",
          PatientID: { $first: "$PatientID" },
          result: { $push: "$result" },
          doctorname: { $push: "$doctorname" },
        },
      },
    ]);

    const combinedResult = {
      patient,
      aggregatedResult: result.length > 0 ? result[0] : null,
    };

    res.status(200).json(combinedResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//===========================================================================================

// add medicine
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
      department,
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
      !department
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { firstName, lastName } = req.verifiedUser;
    const Role = req.verifiedUser?.role?.roleType;

    const MedicineExists = await Medicine.findOne({
      medicineName: new RegExp("^" + medicineName.trim() + "$", "i"),
      branch,
      departments: { $in: [department] },
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
      department,
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

//===================================================================================================================

// get medicines

export const get_medicine = async (req, res) => {
  const { page = 1, limit = 10, search, DepartmentID } = req.query;

  const { BranchID } = req.params;

  //only show status true medicine for user
  let filter = { status: true };

  if (BranchID) filter.branch = BranchID;

  if (DepartmentID) {
    filter.departments = { $in: [DepartmentID] };
  }

  if (search) filter.medicineName = { $regex: search, $options: "i" };

  const medicines = await Medicine.find(filter)
    .populate("branch")
    .populate("departments")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Medicine.countDocuments(filter);

  res.status(200).json({
    medicines,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
};

//===================================================================================================================
