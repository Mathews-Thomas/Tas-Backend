import express from "express"
import {serviceHandler} from "../../services/serviceHandler.js"
import { employeeLogin } from "../../services/employee.js"

const router = express.Router()

router.post("/login",serviceHandler(employeeLogin))



const employeeRouter = router
export default employeeRouter