import express from "express";
import { serviceHandler } from "../../services/serviceHandler.js";
import { branchLogin } from "../../services/branch.js";
import auth from "../../middleware/EmployeeAuth.js";
const router = express.Router()

router.post('/login',serviceHandler(branchLogin),auth(["invoce","patient"]))
const BranchRouter = router
export default BranchRouter

