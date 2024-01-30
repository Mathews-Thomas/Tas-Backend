import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { AddRole, BranchRegister,set_alert, addDepartment,updateStatus,get_Branches, addPatientType,list_doctors,Get_add_doctor,list_addOns ,get_addOns,adddoctor, addPaymentMethod,addprocedure, addVisitorType, employeeRegister, approve } from "../../services/admin.js"
import auth from "../../middleware/EmployeeAuth.js"

const router = express.Router()
//- /admin/ 
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
router.post("/set-alert",auth(),serviceHandler(set_alert))

router.put("/Branch/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/Doctor/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/PatientType/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/PaymentMethod/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/Procedure/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/Department/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/VisitorType/updateStatus",auth(),serviceHandler(updateStatus))
router.put("/Alert/updateStatus",auth(),serviceHandler(updateStatus))

router.put("/Branch/approve",auth(),serviceHandler(approve))
router.put("/Doctor/approve",auth(),serviceHandler(approve))
router.put("/PatientType/approve",auth(),serviceHandler(approve))
router.put("/PaymentMethod/approve",auth(),serviceHandler(approve))
router.put("/Procedure/approve",auth(),serviceHandler(approve))
router.put("/Department/approve",auth(),serviceHandler(approve))
router.put("/VisitorType/approve",auth(),serviceHandler(approve))

router.get("/Get-Branches",auth(),serviceHandler(get_Branches))


const adminRouter = router
export default adminRouter