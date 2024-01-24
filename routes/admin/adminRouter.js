import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { AddRole, BranchRegister, addDepartment, addPatientType,list_doctors,Get_add_doctor,list_addOns ,get_addOns,adddoctor, addPaymentMethod,addprocedure, addVisitorType, employeeRegister } from "../../services/admin.js"
import auth from "../../middleware/EmployeeAuth.js"

const router = express.Router()
//- /admin/
// router.post("/login",serviceHandler(loginAdmin))
router.post("/employee-register",auth() , serviceHandler(employeeRegister)) //admin 
router.post("/branch-register",auth(), serviceHandler(BranchRegister))  // admin
router.post("/add-New-Role",auth(),serviceHandler(AddRole)) //admin
router.post("/add-Department",auth(),serviceHandler(addDepartment)) 
router.post("/add-patientType",auth(),serviceHandler(addPatientType))
router.post("/add-visitorType",auth(),serviceHandler(addVisitorType))
router.post("/add-paymentMethod",auth(),serviceHandler(addPaymentMethod))
router.post("/add-procedure",auth(),serviceHandler(addprocedure))
router.post("/add-doctor",auth(),serviceHandler(adddoctor))
router.get("/add-doctor",auth(),serviceHandler(Get_add_doctor))
router.get("/get-addOns",auth(),serviceHandler(get_addOns))
router.get("/list-addOns",auth(),serviceHandler(list_addOns))
router.get("/list-doctors",auth(),serviceHandler(list_doctors))


const adminRouter = router
export default adminRouter