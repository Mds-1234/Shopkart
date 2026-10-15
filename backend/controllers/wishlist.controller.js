import mongoose from 'mongoose'
import Product from '../models/product.model.js'

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        const alreadyExists = req.customer.wishlist.some(
            (id) => id.toString() === productId
        )

        if (alreadyExists) {
            return res.status(409).json({
                message: "Product already in wishlist"
            })
        }

        req.customer.wishlist.push(product._id)

        await req.customer.save()

        res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        })

    } catch (error) {
        res.status(500).json({
            message: "Server crashed",
            error: error.message
        })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const customer = await req.customer.populate({
            path: "wishlist",
            select: "name price category image stock"
        })

        res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        })

    } catch (error) {
        res.status(500).json({
            message: "Server crashed",
            error: error.message
        })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            })
        }

        const wishlist = req.customer.wishlist

        const productIndex = wishlist.findIndex(
            (id) => id.toString() === productId
        )

        if (productIndex === -1) {
            return res.status(404).json({
                message: "Product not in wishlist"
            })
        }

        wishlist.splice(productIndex, 1)

        await req.customer.save()

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        })

    } catch (error) {
        res.status(500).json({
            message: "Server crashed",
            error: error.message
        })
    }
}