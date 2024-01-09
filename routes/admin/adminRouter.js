import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { BranchRegister, employeeRegister, loginAdmin } from "../../services/admin.js"
import adminAuth from "../../middleware/adminAuth.js"

const router = express.Router()

router.post("/login",serviceHandler(loginAdmin))
router.post("/employee-register",adminAuth() , serviceHandler(employeeRegister))
router.post("/branch-register",adminAuth(), serviceHandler(BranchRegister))
router.post("/add-New-Role",adminAuth(),serviceHandler())


const adminRouter = router
export default adminRouter