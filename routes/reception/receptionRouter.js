import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { addPatient, employeeLogin,get_branch, getAddPatient,getPatientList,getInviuceDropdowns, addInvoice,getPatientInvoiceList,get_alert } from "../../services/reception.js"
import auth from "../../middleware/EmployeeAuth.js"

const router = express.Router()

router.post("/login",serviceHandler(employeeLogin))
router.post("/add-patient",auth(), serviceHandler(addPatient))
router.get("/add-patient/:BranchID",auth(), serviceHandler(getAddPatient))
router.get("/patient-list/:BranchID",auth(), serviceHandler(getPatientList))
router.get("/add-invoice",auth(), serviceHandler(getInviuceDropdowns))
router.post("/add-invoice",auth(), serviceHandler(addInvoice))
router.get("/patient-invoice-list/:BranchID",auth(), serviceHandler(getPatientInvoiceList))
router.get("/get-alert/:BranchID",auth(),serviceHandler(get_alert))
router.get("/get-branch/:BranchID",auth(),serviceHandler(get_branch))




const receptionRouter = router
export default receptionRouter