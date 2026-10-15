import express from 'express'
import { createProduct, getAllProducts, getCategories, getProductById } from '../controllers/product.controller.js'

const productRoutes = express.Router()

productRoutes.post('/', createProduct)
productRoutes.get('/', getAllProducts)
productRoutes.get('/categories', getCategories)
productRoutes.get('/:id', getProductById)

export default productRoutes