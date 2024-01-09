import Branch from "../models/BranchSchema.js"
import Employee from "../models/EmployeeSchema.js"
import Role from "../models/RoleSchema.js"
import Admin from "../models/adminSchema.js"
import { validateInputs } from "../validation/validate.js"
import { jwtSignAdmin} from "./Jwt.js"
import bcrypt from "bcrypt"

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
    const { firstName, lastName, email, phone, position, department, securityCredentials, role } = req.body;
    const createdAt = new Date();

    const validationErrors = await validateInputs([
        [firstName, "name", "firstName"],
        [lastName, "name", "lastName"],
        [email, "email", "email"],
        [phone, "phone", "phone"],
        [position, "position", "position"],
        [department, "department", "department"],
        [role, "role", "role"],
    ]);

    if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    const userExist = await Employee.findOne({ "securityCredentials.loginId": securityCredentials.loginId });
    if (userExist) {
        return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(securityCredentials.password, 10);
    const newEmployee = {firstName,lastName,email,phone,position,department,role,createdAt,
        securityCredentials: { ...securityCredentials, password: hashedPassword },
    };
    const emp = await Employee.create(newEmployee);
    const { securityCredentials: _, ...EmpData } = emp.toObject();

    return res.status(200).json({ message: "Employee registered successfully", EmpData });
}


export const BranchRegister = async (req,res)=>{
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

const encryptedPassword = await bcrypt.hash(securityCredentials.password, 10);
const createdAt = new Date();
const newBranch = { ...req.body, createdAt, securityCredentials: { ...securityCredentials, password: encryptedPassword } };
const createdBranch = await Branch.create(newBranch);
 
const { securityCredentials: _, ...branchData } = createdBranch.toObject();
return res.status(200).json({message: "Branch registered successfully",...branchData});

}

export const AddRole = async (req,res)=>{
    const [name,permissions,roleType] = req.body
    const createdAt = new Date()
   const validationErrors = validateInputs([
    [name,"name","Empoyee Position"],
    [roleType,"name","Role Type"],
    [permissions,"permissions","permissions"]
    ])

    if(Object.keys(validationErrors).length>0){
        return res.status(400).json({errors:validationErrors})
    }

    const NameExist = await Role.findOne({name:name})
    if(NameExist){
        return res.status(400).json({ errors: "Role Name is already existed" });
    }
    const NewRole = Roll.create({name,permissions,createdAt:createdAt})
        return res.status(200).json(NewRole)

}





