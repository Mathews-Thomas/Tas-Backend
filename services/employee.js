import Employee from "../models/EmployeeSchema.js";
import { validateInputs } from "../validation/validate.js";
import { jwtSign } from "./Jwt.js";
import bcrypt from 'bcrypt';

export const employeeLogin = async (req, res) => {
    const { loginId, password } = req.body;

    const validationErrors = validateInputs([
        [loginId, "loginId", "user id"],
        [password, "password", "password"]
    ]);

    if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({ errors: validationErrors });
    }

    const employee = await Employee.findOne({ "securityCredentials.loginId": loginId }).populate('role')
    if (!employee) {
        return res.status(401).json({ err: "Username mismatched" });
    }

    const isPasswordMatch = await bcrypt.compare(password, employee.securityCredentials.password);
    if (!isPasswordMatch) {
        return res.status(401).json({ err: "Password mismatched" });
    }

    const employeeData = employee.toObject();
    delete employeeData.securityCredentials.password; // Remove password for security
    const token = jwtSign(employeeData._id.toString());
    return res.status(200).json({ Employee: employeeData, token: token });
};
