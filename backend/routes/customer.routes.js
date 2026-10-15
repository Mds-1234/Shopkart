import express from "express"
import { loginCustomer,registerCustomer,getMe,logOut } from "../controllers/customer.controller.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"

const customerRoutes = express.Router()

customerRoutes.post('/register',registerCustomer)
customerRoutes.post('/login', loginCustomer)
customerRoutes.get('/me' , isAuthenticated ,getMe )
customerRoutes.post('/logout',isAuthenticated,logOut)

export default customerRoutes