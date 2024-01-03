import Branch from "../models/BranchSchema.js"
import { validateInputs } from "../validation/validate.js"
import { jwtSign } from "./Jwt.js"

export const branchLogin = async (req,res)=>{
    const {loginId,password} = req.body
const validationErrors = validateInputs([
    [loginId,"loginId","loginId"],
    [password,"password","loginId"]
])
if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({ errors: validationErrors });
}
const branch = await Branch.findOne({"securityCredentials.loginId":loginId})
if(branch){
    if(branch.securityCredentials.password === password){
        const BranchData = branch.toObject();
        delete BranchData.securityCredentials.password; //deleted password
        const token = jwtSign(BranchData._id.toString())
        return res.status(200).json({ Branch: BranchData,token:token });
    }else{
        return res.status(401).json({err:"password Missmatched"})
    }
}else{
    return res.status(401).json({err:"userName Missmatched"})
}
}