import Branch from "../models/BranchSchema.js"
import { validateInputs } from "../validation/validate.js"
import { jwtSign } from "./Jwt.js"
import bcrypt from 'bcrypt'

export const branchLogin = async (req,res)=>{
    const {loginId,password} = req.body
const validationErrors = validateInputs([
    [loginId,"loginId","loginId"],
    [password,"password","loginId"]
])
if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
}

const branch = await Branch.findOne({ "securityCredentials.loginId": loginId });
if (!branch) {
    return res.status(401).json({ error: "Username mismatched" });
}
const isPasswordMatch = await bcrypt.compare(password, branch.securityCredentials.password);
if (!isPasswordMatch) {
    return res.status(401).json({ error: "Password mismatched" });
}

const branchData = branch.toObject();
delete branchData.securityCredentials.password; 
const token = jwtSign(branchData._id.toString())
       return res.status(200).json({ Branch: branchData,token:token });
 
}