import jwt from 'jsonwebtoken';
import Admin from '../models/adminSchema.js';
import mongoose from 'mongoose';

const adminAuth = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            const token = req.cookies[process.env.JWT_TOKEN_NAME] ?? req.headers.authorization;
            if (!token) return res.status(401).send({ error: "Token is required" });

            jwt.verify(token, process.env.AUTH_SECRET_KEY_ADMIN, async (error, data) => {
                if (error) {
                    return res.status(401).send({ error: "User is not verified" });
                }

                const adminData = await Admin.findOne({
                    _id: new mongoose.Types.ObjectId(data.adminId)
                }).populate('role'); // Attempt to populate the role

                if (!adminData?.status) {
                    return res.status(401).send({ error: "User has been blocked" });
                } 
                // Check if role data exists and has required permissions
                if (requiredPermissions.length > 0) {
                    if (!adminData.role || !adminData.role.permissions) {
                        return res.status(403).send({ error: 'permission is missing or incomplete' });
                    }

                    const hasPermission = requiredPermissions.every(p => 
                        adminData.role.permissions.includes(p));

                    if (!hasPermission) {
                        return res.status(403).send({ error: 'Access Denied: Insufficient Permissions' });
                    }
                }

                req.verifiedUser = adminData;
                next();
            });
        } catch (error) {
            return res.status(500).send({ error: "Internal error occurred" });
        }
    };
};

export default adminAuth;
