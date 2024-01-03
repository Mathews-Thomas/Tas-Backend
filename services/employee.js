import Employee from "../models/EmployeeSchema.js";
import { validateInputs } from "../validation/validate.js"
import { jwtSign } from "./Jwt.js";


export const employeeLogin = async (req,res) =>{
const {loginId,password} = req.body
const validationErrors = validateInputs([
[loginId,"loginId","user id"],
[password,"password","password"]
])
if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
}

const Employee = await Employee.findOne({"securityCredentials.loginId":loginId})
if(Employee){
    if(Employee.securityCredentials.password === password){
        const EmployeeData = Employee.toObject();
        delete EmployeeData.securityCredentials.password; //deleted password
        const token = jwtSign(EmployeeData._id.toString())
        return res.status(200).json({ Employee: EmployeeData,token:token });
    }else{
        return res.status(401).json({err:"password Missmatched"})
    }
}else{
    return res.status(401).json({err:"userName Missmatched"})
}



}