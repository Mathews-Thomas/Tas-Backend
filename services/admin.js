import Branch from "../models/BranchSchema.js"
import Employee from "../models/EmployeeSchema.js"
import Admin from "../models/adminSchema.js"
import { validateInputs } from "../validation/validate.js"
import { jwtSignAdmin} from "./Jwt.js"

export const  loginAdmin = async (req,res) =>{
const {loginId,password} = req.body 
const admin = await Admin.findOne({"securityCredentials.loginId":loginId})
if(admin){
    if(admin.securityCredentials.password === password){
        const adminData = admin.toObject();
        delete adminData.securityCredentials.password; //deleted password
        const token = jwtSignAdmin(adminData._id.toString())
        return res.status(200).json({ admin: adminData,token:token });
    }else{
        return res.status(401).json({err:"password Missmatched"})
    }
}else{
    return res.status(401).json({err:"userName Missmatched"})
}
}


export const employeeRegister = async (req,res) =>{
const {firstName,lastName,email,phone,position,department,securityCredentials} = req.body
const createdAt = new Date()
const validationErrors = validateInputs([
    [firstName,"name","firstName"],
    [lastName,"name","lastName"],
    [email,"email","email"],
    [phone,"phone","phone"],
    [position,"psoision","position"],
    [department,"position","department"],
])

if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
}

const userExist = await Employee.findOne({"securityCredentials.loginId":req.body.securityCredentials.loginId})
if(userExist){
    return res.status(400).json({ errors: "username already existed" });
}
const emp = await Employee.create({...req.body,createdAt});

return res.status(200).json(emp)
}


export const BranchRegister = async (req,res)=>{
    const createdAt = new Date()
    const {branchName,location,contact,securityCredentials}= req.body
    const validationErrors = validateInputs([
    [branchName,"name","branchName"],
    [location?.address,"address","address"],
    [location?.city,"name","city"],
    [location?.state,"name","state"],
    [location?.country,"name","country"],
    [location?.pincode,"zip","pincode"],
    [contact?.phone,"phone","Phone Number"],
    [contact?.email,"email","email"],
    [securityCredentials?.loginId,"loginId","user id"],
])

if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
}
const BranchExist = await Branch.findOne({"securityCredentials.loginId":req.body.securityCredentials.loginId})
if(BranchExist){
    return res.status(400).json({ errors: "Branch id already existed" });
}
    const emp = await Branch.create({...req.body,createdAt});

return res.status(200).json(emp)

}





