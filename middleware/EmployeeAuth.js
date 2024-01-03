import jwt from 'jsonwebtoken';
import Employee from '../models/EmployeeSchema';
import mongoose from 'mongoose';

const auth = (req, res, next) => {
    try {
        const token = req.cookies[process.env.JWT_TOKEN_NAME] ?? req.headers.authorization;
        if(!token) return res.status(401).send({error: "Token is required"})
        jwt.verify(token, process.env.AUTH_SECRET_KEY, async (error, data) => {
            if(error){
                return res.status(401).send({error: "User is not verified"})
            }
            const userData = await Employee.findOne({
                _id: new mongoose.Types.ObjectId(data.EmployeeId)
            })
            if(!userData?.status){
                return res.status(401).send({error: "User has been blocked"})
            }
            req.verifiedUserId = data.EmployeeId;
            next();
        })
    } catch (error) {
        return res.status(500).send({error: "Internal error occurred"})
    }
}

export default auth;