import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { addPatient, employeeLogin,get_branch,branchLogin,edit_Patient,editInvoice,delete_invoice, getAddPatient,getPatientList,getInviuceDropdowns, addInvoice,getPatientInvoiceList,get_alert, getPatientDetails, add_medicine } from "../../services/reception.js"
import auth from "../../middleware/EmployeeAuth.js"


const router = express.Router()

// Employee Login 
router.post("/login", serviceHandler(employeeLogin))

// Branch Login
router.post('/branch/login',serviceHandler(branchLogin),auth(["invoce","patient"]))

// Patient 
router.post("/add-patient", auth(), serviceHandler(addPatient))
router.post("/edit-patient", auth(), serviceHandler(edit_Patient))
router.get("/add-patient/:BranchID", auth(), serviceHandler(getAddPatient))
router.get("/patient-list/:BranchID", auth(), serviceHandler(getPatientList))
router.get("/patient-profile/:id",auth(),serviceHandler(getPatientDetails))

// invoice 
router.get("/add-invoice", auth(), serviceHandler(getInviuceDropdowns))
router.post("/add-invoice", auth(), serviceHandler(addInvoice))
router.post("/edit-invoice", auth(), serviceHandler(editInvoice))
router.get("/patient-invoice-list/:BranchID", auth(), serviceHandler(getPatientInvoiceList))
router.delete("/delete-invoice/:invoiceID", auth(), serviceHandler(delete_invoice))

// extra
router.get("/get-alert/:BranchID", auth(), serviceHandler(get_alert))
router.get("/get-branch/:BranchID", auth(), serviceHandler(get_branch))

// medicines
router.post("/medicine/add-medicine",auth(),serviceHandler(add_medicine))

const receptionRouter = router
export default receptionRouter