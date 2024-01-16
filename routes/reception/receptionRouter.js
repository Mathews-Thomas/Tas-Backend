import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { addPatient, employeeLogin, getAddPatient,getPatientList,getInviuceDropdowns } from "../../services/reception.js"
import auth from "../../middleware/EmployeeAuth.js"

const router = express.Router()

router.post("/login",serviceHandler(employeeLogin))
router.post("/add-patient",auth(), serviceHandler(addPatient))
router.get("/add-patient/:BranchID",auth(), serviceHandler(getAddPatient))
router.get("/patient-list/:BranchID",auth(), serviceHandler(getPatientList))
router.get("/add-invoice",auth(), serviceHandler(getInviuceDropdowns))



const receptionRouter = router
export default receptionRouter