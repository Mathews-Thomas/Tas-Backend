import jwt from 'jsonwebtoken';

export const jwtSign = (EmployeeId) => {
    return jwt.sign({
        EmployeeId
    },
    process.env.AUTH_SECRET_KEY,
    {
        expiresIn: '7d'
    })
}

export const jwtSignAdmin = (adminId) => {
    return jwt.sign({
        adminId
    },
    process.env.AUTH_SECRET_KEY_ADMIN,
    {
        expiresIn: '1d'
    })
}