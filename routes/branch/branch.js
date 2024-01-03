import express from "express";
import { serviceHandler } from "../../services/serviceHandler.js";
import { branchLogin } from "../../services/branch.js";
const router = express.Router()

router.post('/login',serviceHandler(branchLogin))

const BranchRouter = router
export default BranchRouter

