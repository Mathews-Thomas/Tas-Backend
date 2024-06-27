import express from "express";
import { serviceHandler } from "../../services/serviceHandler.js";
import {
  set_appointment,
  report_filter,
  consolidated_progress_reports,
  edit_MainDepartment,
  user_details,
  addMainDepartment,
  consolidated_reports,
  AddRole,
  get_task,
  delete_task,
  adminhome_reports,
  edit_task,
  set_task,
  updatetaskStatus,
  BranchRegister,
  set_alert,
  report_filter_options,
  Edit,
  addDepartment,
  updateStatus,
  get_Branches,
  addPatientType,
  list_doctors,
  Get_add_doctor,
  list_addOns,
  get_addOns,
  adddoctor,
  addPaymentMethod,
  addprocedure,
  addVisitorType,
  employeeRegister,
  approve,
  AlertEdit,
  ProcedureEdit,
  departmntEdit,
  BranchEdit,
  EmployeeEdit,
  PaymentMethodEdit,
  editDoctor,
  edit_Add_Ons,
  viewMainDepartment,
  add_medicine,
  get_medicines,
  edit_medicine,
  update_medicine_status,
  add_medicine_invoice,
  get_Medicine_Invoice_Dropdowns,
  // add_medicine_invoice,
} from "../../services/admin.js";
import auth from "../../middleware/EmployeeAuth.js";

const router = express.Router();
// Employee
router.post("/employee-register", auth(), serviceHandler(employeeRegister));
router.put("/Employee/edit", auth(), serviceHandler(EmployeeEdit));
router.put("/Employee/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/Employee/approve", auth(), serviceHandler(approve));

// Department
router.post("/add-Department", auth(), serviceHandler(addDepartment));
router.put("/Department/edit", auth(), serviceHandler(departmntEdit));
router.put("/Department/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/Department/approve", auth(), serviceHandler(approve));

// Main Department
router.post("/MainDepartment", auth(), serviceHandler(addMainDepartment));
router.put("/MainDepartment/edit", auth(), serviceHandler(edit_MainDepartment));
router.get(
  "/Viw_MainDepartment/:id",
  auth(),
  serviceHandler(viewMainDepartment)
);
router.put(
  "/MainDepartment/updateStatus",
  auth(),
  serviceHandler(updateStatus)
);
router.put("/MainDepartment/approve", auth(), serviceHandler(approve));

// Branch
router.post("/branch-register", auth(), serviceHandler(BranchRegister));
router.put("/Branch/edit", auth(), serviceHandler(BranchEdit));
router.put("/Branch/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/Branch/approve", auth(), serviceHandler(approve));
router.get("/Get-Branches", auth(), serviceHandler(get_Branches));

// Doctor
router.post("/add-doctor", auth(), serviceHandler(adddoctor));
router.get("/add-doctor", auth(), serviceHandler(Get_add_doctor));
router.put("/Doctor/edit", auth(), serviceHandler(editDoctor));
router.get("/list-doctors", auth(), serviceHandler(list_doctors));
router.put("/Doctor/approve", auth(), serviceHandler(approve));
router.put("/Doctor/updateStatus", auth(), serviceHandler(updateStatus));

// patient type
router.post("/add-patientType", auth(), serviceHandler(addPatientType));
router.put("/PatientType/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/PatientType/edit", auth(), serviceHandler(Edit));
router.put("/PatientType/approve", auth(), serviceHandler(approve));

// Visitor type
router.post("/add-visitorType", auth(), serviceHandler(addVisitorType));
router.put("/VisitorType/approve", auth(), serviceHandler(approve));
router.put("/VisitorType/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/VisitorType/edit", auth(), serviceHandler(Edit));

// Payment Method
router.post("/add-paymentMethod", auth(), serviceHandler(addPaymentMethod));
router.put("/PaymentMethod/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/PaymentMethod/approve", auth(), serviceHandler(approve));
router.put("/PaymentMethod/edit", auth(), serviceHandler(PaymentMethodEdit));

// Add Ons
router.get("/edit-addOns", auth(), serviceHandler(edit_Add_Ons));
router.get("/get-addOns", auth(), serviceHandler(get_addOns));
router.get("/list-addOns", auth(), serviceHandler(list_addOns));

// Alert
router.post("/set-alert", auth(), serviceHandler(set_alert));
router.put("/Alert/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/Alert/edit", auth(), serviceHandler(AlertEdit));

// Procedure
router.post("/add-procedure", auth(), serviceHandler(addprocedure));
router.put("/Procedure/updateStatus", auth(), serviceHandler(updateStatus));
router.put("/Procedure/approve", auth(), serviceHandler(approve));
router.put("/Procedure/edit", auth(), serviceHandler(ProcedureEdit));

// Reports
router.get("/report/filter", serviceHandler(report_filter));
router.get("/report/filterOptions", serviceHandler(report_filter_options));
router.get("/adminhome-reports", auth(), serviceHandler(adminhome_reports));
router.get("/consolidated-reports", serviceHandler(consolidated_reports));
router.get(
  "/consolidated-progress-reports",
  serviceHandler(consolidated_progress_reports)
);

// Task
router.delete("/task/delete-task", auth(), serviceHandler(delete_task));
router.put("/task/updatetaskStatus", auth(), serviceHandler(updatetaskStatus));
router.put("/task/edit-task", auth(), serviceHandler(edit_task));
router.post("/set-task", auth(), serviceHandler(set_task));
router.get("/get-task", auth(), serviceHandler(get_task));

// Extra
router.get("/get-user", auth(), serviceHandler(user_details));
router.post("/add-New-Role", serviceHandler(AddRole));

// Appointment
router.post("/set-appointment", auth(), serviceHandler(set_appointment));

//medicine
router.post("/medicine/add-medicine", auth(), serviceHandler(add_medicine));
router.get("/medicine/get-medicine/:BranchID", serviceHandler(get_medicines));
router.put("/medicine/edit-medicine", auth(), serviceHandler(edit_medicine));
router.put(
  "/medicine/update-medicine-status",
  auth(),
  serviceHandler(update_medicine_status)
);

// medicine invoice 
 router.post("/medicine/add-invoice", serviceHandler(add_medicine_invoice));
 router.get("/medicine/get-invoice", auth(),serviceHandler(get_Medicine_Invoice_Dropdowns));

const adminRouter = router;
export default adminRouter;
