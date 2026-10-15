import mongoose from "mongoose"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"

export const addToCart = async (req, res) => {
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

        const cartItem = req.customer.cart.find(
            item => (item.product?._id || item.product).toString() === productId
        )

        if (cartItem) {
            if (cartItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    message: "Requested quantity exceeds available stock"
                })
            }

            cartItem.quantity += 1
        } else {
            if (product.stock < 1) {
                return res.status(400).json({
                    message: "Product is out of stock"
                })
            }

            req.customer.cart.push({
                product: product._id,
                quantity: 1
            })
        }

        await req.customer.save()
        await req.customer.populate({
            path: "cart.product",
            select: "name price image stock category description"
        })

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: req.customer.cart
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id)
            .populate({
                path: "cart.product",
                select: "name price image stock category description"
            })

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            })
        }

        const validCart = customer.cart.filter(item => item.product !== null)

        return res.status(200).json({
            success: true,
            cart: validCart
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

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

        const cartItem = req.customer.cart.find(
            item => (item.product?._id || item.product).toString() === productId
        )

        if (!cartItem) {
            return res.status(404).json({
                message: "Product not found in cart"
            })
        }

        if (typeof quantity !== "number" || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            })
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: "Requested quantity exceeds available stock"
            })
        }
        
        cartItem.quantity = quantity

        await req.customer.save()
        await req.customer.populate({
            path: "cart.product",
            select: "name price image stock category description"
        })

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: req.customer.cart
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: "Invalid product ID"
            })
        }

        const cartItemIndex = req.customer.cart.findIndex(
            item => (item.product?._id || item.product).toString() === productId
        )

        if (cartItemIndex === -1) {
            return res.status(404).json({
                message: "Product not found in cart"
            })
        }

        req.customer.cart.splice(cartItemIndex, 1)

        await req.customer.save()
        await req.customer.populate({
            path: "cart.product",
            select: "name price image stock category description"
        })

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: req.customer.cart
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error"
        })
    }
}