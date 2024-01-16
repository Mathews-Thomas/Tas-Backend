import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { AddRole, BranchRegister, addDepartment, addPatientType ,adddoctor, addPaymentMethod,addprocedure, addVisitorType, employeeRegister, loginAdmin } from "../../services/admin.js"
import auth from "../../middleware/EmployeeAuth.js"

const router = express.Router()

router.post("/login",serviceHandler(loginAdmin))
router.post("/employee-register",auth() , serviceHandler(employeeRegister))
router.post("/branch-register",auth(), serviceHandler(BranchRegister))
router.post("/add-New-Role",auth(),serviceHandler(AddRole))
router.post("/add-Department",auth(["department"]),serviceHandler(addDepartment))
router.post("/add-patientType",auth(),serviceHandler(addPatientType))
router.post("/add-visitorType",auth(),serviceHandler(addVisitorType))
router.post("/add-paymentMethod",auth(),serviceHandler(addPaymentMethod))
router.post("/add-procedure",auth(),serviceHandler(addprocedure))
router.post("/add-doctor",auth(),serviceHandler(adddoctor))


const adminRouter = router
export default adminRouter