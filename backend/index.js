import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import customerRoutes from './routes/customer.routes.js'
import productRoutes from './routes/product.routes.js'
import wishlistRoutes from './routes/wishlist.routes.js'
import cartRoutes from './routes/cart.routes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import orderRoutes from "./routes/order.routes.js"

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const Port = process.env.PORT || 8085

dotenv.config({ path: path.resolve(__dirname, '.env') })
if (!process.env.dbUrl) {
    dotenv.config()
}

if (!process.env.dbUrl) {
    console.error("MongoDB Error: dbUrl environment variable is not defined. Please check your .env file.")
} else {
    mongoose.connect(process.env.dbUrl).then(() => {
        console.log("Db Connected")
    }).catch((err) => {
        console.error("MongoDB Connection Error:", err.message || err)
    })
}

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL.replace(/\/+$/, "")))) {
            return callback(null, true)
        }
        return callback(null, true)
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/customers', customerRoutes)
app.use('/products', productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' })
})

app.get('/', (req, res) => {
    res.send('Welcome Customer')
})

app.listen(Port, "0.0.0.0", () => {
    console.log(`Server Started at ${Port}`)
})