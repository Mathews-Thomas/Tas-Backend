import Branch from "../models/BranchSchema.js"
import Employee from "../models/EmployeeSchema.js"
import Role from "../models/RoleSchema.js"
import { validateInputs } from "../validation/validate.js"
import { jwtSign} from "./Jwt.js"
import bcrypt from "bcrypt"
import Department from "../models/DepartmentSchema.js" 
import PaymentMethod from "../models/PaymentMethodSchema.js"
import VisitorType from "../models/visitorTypeSchema.js"
import PatientType from "../models/patientTypeSchema.js"
import Procedure from "../models/ProcedureSchema.js"
import Doctor from "../models/DoctorSchema.js"

export const loginAdmin = async (req, res) => {
    const { loginId, password } = req.body;
    const admin = await Employee.findOne({ "securityCredentials.loginId": loginId });

    if (admin) {
        const passwordMatch = await bcrypt.compare(password, admin.securityCredentials.password);
        if (passwordMatch) {
            const adminData = admin.toObject();
            delete adminData.securityCredentials.password; // Deleted password
            const token = jwtSign(adminData._id.toString());
            return res.status(200).json({ admin: adminData, token: token });
        } else {
            return res.status(401).json({ err: "Password Mismatched" });
        }
    } else {
        return res.status(401).json({ err: "Username Mismatched" });
    }
};





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
    if (userExist) return res.status(400).json({ error: "Username already exists" });

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
    const validationErrors = await validateInputs([
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


if (Object.keys(validationErrors).length > 0) return res.status(400).json({ errors: validationErrors });

const BranchExist = await Branch.findOne({"securityCredentials.loginId":req.body.securityCredentials.loginId})
if(BranchExist) return res.status(400).json({ errors: "Branch id already existed" });


const encryptedPassword = await bcrypt.hash(securityCredentials.password, 10);
const createdAt = new Date();
const newBranch = { ...req.body, createdAt, securityCredentials: { ...securityCredentials, password: encryptedPassword } };
const createdBranch = await Branch.create(newBranch);
 
const { securityCredentials: _, ...branchData } = createdBranch.toObject();
return res.status(200).json({message: "Branch registered successfully",...branchData});

}

export const AddRole = async (req,res)=>{
    const {name,permissions,roleType} = req.body 
   const validationErrors = await validateInputs([
    [name,"name","Empoyee Position"],
    [roleType,"name","Role Type"],
    [permissions,"permissions","permissions"]
    ])

    if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})

    const NameExist = await Role.findOne({name:name})

    if(NameExist) return res.status(400).json({ errors: "Role Name is already existed" });
    
    const NewRole = Role.create({name,permissions,roleType})
        return res.status(200).json(NewRole)

}


export const addDepartment = async (req,res)=>{
const {Name,BranchID} = req.body
const {firstName,lastName} = req.verifiedUser
const validationErrors = await validateInputs([
    [Name,"name","Department Name"],
    [BranchID,"objectID","Branch"]
])

if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})

let newDepartment = {
    Name,
    BranchID,
    createdBy:firstName+" "+lastName
}

const DepartmentExist = await Department.findOne({Name:Name})

if(DepartmentExist) return res.status(400).json({ errors: "Department Name is already existed" });

 Department.create(newDepartment)
 .then((data)=> res.status(200).json({message:"New Department created successfully",data}))
 .catch((err)=> res.status(200).json({message:"error",err}))

}


export const addPatientType  = async (req,res)=>{
    const {type,description} = req.body 
    const {firstName,lastName} = req.verifiedUser

    const validationErrors = await validateInputs([
        [type,"name","type"],
        [description,"address","description"]
    ])
    if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})

    const newPatientType ={
        type:type,
        description,
        createdBy:firstName+" "+lastName,
        status:true,
    }
    const typeExists = await PatientType.findOne({ type: new RegExp('^' + type.trim() + '$', 'i') });
    if (typeExists) return res.status(400).json({ error: "Patient type already exists" });

    PatientType.create(newPatientType)
    .then((data)=> res.status(200).json({message:"New PatientType created successfully",data}))
    .catch((err)=> res.status(200).json({message:"error",err}))
 
}


export const addVisitorType = async (req,res)=>{
    const {type,description} = req.body 
    const {firstName,lastName} = req.verifiedUser

    const validationErrors = await validateInputs([
        [type,"name","type"],
        [description,"address","description"]
    ])
    if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})

    const newVisitorTypes ={
        type:type,
        description,
        createdBy:firstName+" "+lastName,
        status:true,
    }
    const typeExists = await VisitorType.findOne({ type: new RegExp('^' + type.trim() + '$', 'i') });
    if (typeExists) return res.status(400).json({ error: "visitorType already exists" });

    VisitorType.create(newVisitorTypes)
    .then((data)=> res.status(200).json({message:"New VisitorType created successfully",data}))
    .catch((err)=> res.status(200).json({message:"error",err}))
 
}

export const addPaymentMethod = async (req,res)=>{
    const {Method} = req.body 
    const {firstName,lastName} = req.verifiedUser
    const validationErrors = await validateInputs([
        [Method,"name","Method"]
    ])
    if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})

    const newPaymentMethod ={
        Method:Method, 
        createdBy:firstName+" "+lastName,
        status:true,
    }
    
    const methodExists = await PaymentMethod.findOne({ type: new RegExp('^' + Method.trim() + '$', 'i') });
    if (methodExists) return res.status(400).json({ error: "paymentMethod already exists" });
    PaymentMethod.create(newPaymentMethod)
    .then((data)=> res.status(200).json({message:"New paymentMethod created successfully",data}))
    .catch((err)=> res.status(200).json({message:"error",err}))

}

export const addprocedure = async (req,res)=>{
    const {procedure,description,Cost,DepartmentID} = req.body
    const {firstName,lastName} = req.verifiedUser
    const validationErrors = await validateInputs([
        [procedure,"name","procedure"],
        [Cost,"price","Cost"],
        [DepartmentID,"objectID","DepartmentID"],
        [description,"address","description"]
    ])
    if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})
    
    const newProcedure ={
        procedure, 
        description ,
        Cost,
        DepartmentID,
        createdBy:firstName+" "+lastName,
        status:true,
    }
    
    const procedureExists = await Procedure.findOne({ procedure: new RegExp('^' + procedure.trim() + '$', 'i') });
    if (procedureExists) return res.status(400).json({ error: "Procedure already exists" });
    Procedure.create(newProcedure)
    .then((data)=> res.status(200).json({message:"New Procedure created successfully",data}))
    .catch((err)=> res.status(200).json({message:"error",err}))
    
}


export const adddoctor = async (req,res) =>{
    const {name,age,Gender,specialization,contact,BranchID,DepartmentID} = req.body
    const {firstName,lastName} = req.verifiedUser

    const validationErrors = await validateInputs([
        [name,"name","name"],
        [age,"age","age"],
        [Gender,"gender","Gender"],
        [DepartmentID,"objectID","DepartmentID"],
        [BranchID,"objectID","BranchID"],
        [specialization,"address","specialization"],
        [contact.phone,"phone","phone"]
    ])
    if(Object.keys(validationErrors).length>0) return res.status(400).json({errors:validationErrors})

    const newDoctor ={
        name, 
        age,
        Gender,
        specialization, 
        DepartmentID,
        BranchID,
        contact,
        createdBy:firstName+" "+lastName,
        status:true,
    }

    const DoctorExists = await Doctor.findOne({ name: new RegExp('^' + name.trim() + '$', 'i') });
    if (DoctorExists) return res.status(400).json({ error: "Procedure already exists" });
    Doctor.create(newDoctor)
    .then((data)=> res.status(200).json({message:"New Doctor Added successfully",data}))
    .catch((err)=> res.status(200).json({message:"error",err}))


}












