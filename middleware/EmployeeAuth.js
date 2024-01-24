import jwt from "jsonwebtoken";
import Employee from "../models/EmployeeSchema.js";
import mongoose from "mongoose";

const auth = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const token =
        req.cookies[process.env.JWT_TOKEN_NAME] ?? req.headers.authorization;
      if (!token) return res.status(401).send({ error: "Token is required" });

      jwt.verify(token, process.env.AUTH_SECRET_KEY, async (error, data) => {
        if (error) {
          return res.status(401).send({ error: "User is not verified" });
        }

        const userData = await Employee.findOne({
          _id: new mongoose.Types.ObjectId(data.EmployeeId),
        }).populate("role"); // Attempt to populate the role 
        if (!userData?.status) {
          return res.status(401).send({ error: "User has been blocked" });
        }

        // Check if role data exists and has required permissions
        if (requiredPermissions.length > 0) {
          if (!userData.role || !userData.role.permissions) {
            return res
              .status(403)
              .send({ error: "Permission is missing or incomplete" });
          }

          const hasPermission = requiredPermissions.every((p) =>
            userData.role.permissions.includes(p)
          );

          if (!hasPermission && !userData.role.permissions.includes('superAdminAccess')) {
            return res
              .status(403)
              .send({ error: "Access Denied: Insufficient Permissions" });
          }
        }

        req.verifiedUser =userData;
        next();
      });
    } catch (error) {
      return res.status(500).send({ error: "Internal error occurred" });
    }
  };
};

export default auth;
