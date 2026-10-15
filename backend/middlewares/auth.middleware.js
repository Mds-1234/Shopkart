import jwt from 'jsonwebtoken'
import Customer from '../models/customer.model.js'

export const isAuthenticated = async (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            (req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null)

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: No token provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const customer = await Customer.findById(decoded.userId)

        if (!customer) {
            return res.status(401).json({
                message: "Unauthorized: User not found"
            })
        }

        req.customer = customer

        next()
    } catch (error) {
        res.status(401).json({
            message: "Invalid token or token expired"
        })
    }
}