import express from "express"
import { isAuthenticated } from "../middlewares/auth.middleware.js"
import {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getMyOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js"

const orderRoutes = express.Router()

orderRoutes.post("/create-payment-order", isAuthenticated, createPaymentOrder)
orderRoutes.post("/verify-payment", isAuthenticated, verifyPayment)
orderRoutes.get("/", isAuthenticated, getMyOrders)
orderRoutes.get("/:id", isAuthenticated, getMyOrderById)
orderRoutes.patch("/:id/status", isAuthenticated, updateOrderStatus)

export default orderRoutes
