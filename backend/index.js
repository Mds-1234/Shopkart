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
const Port = 8085

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

app.use(cors({
    origin: true,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/customers' , customerRoutes)
app.use('/products',productRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use("/orders", orderRoutes)

app.get('/', (req, res) => {
    res.send('Welcome Customer')
})


app.listen(Port, () => {
    console.log(`Server Started at ${Port}`)
})