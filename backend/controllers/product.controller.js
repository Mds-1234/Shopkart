import mongoose from 'mongoose'
import Product from '../models/product.model.js'

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            image,
            stock
        } = req.body

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        if (price <= 0) {
            return res.status(400).json({
                message: 'Price must be greater than 0'
            })
        }

        if (stock < 0) {
            return res.status(400).json({
                message: 'Stock cannot be negative'
            })
        }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        })

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        })

    } catch (error) {
        res.status(500).json({
            message: 'Server crashed',
            error: error.message
        })
    }
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export const getAllProducts = async (req, res) => {
    try {
        const { search, category, q } = req.query

        const query = {}

        const searchTerm = search || q

        if (searchTerm && searchTerm.trim() !== '') {
            query.name = {
                $regex: escapeRegex(searchTerm.trim()),
                $options: 'i'
            }
        }

        if (category && category.trim() !== '' && category.trim() !== 'All') {
            query.category = {
                $regex: `^${escapeRegex(category.trim())}$`,
                $options: 'i'
            }
        }

        const products = await Product.find(query)

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })

    } catch (error) {
        res.status(500).json({
            message: "Server crashed",
            error: error.message
        })
    }
}

export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category')
        res.status(200).json({
            success: true,
            categories
        })
    } catch (error) {
        res.status(500).json({
            message: "Server crashed",
            error: error.message
        })
    }
}

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            })
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        res.status(500).json({
            message: "Server crashed",
            error: error.message
        })
    }
}