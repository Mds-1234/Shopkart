import mongoose from "mongoose"
import crypto from "crypto"
import Customer from "../models/customer.model.js"
import Product from "../models/product.model.js"
import Order from "../models/order.model.js"
import razorpay from "../config/razorpay.js"

const validateShippingAddress = (address) => {
    const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"]
    if (!address || typeof address !== "object") return "Shipping address is required"

    for (const field of fields) {
        if (typeof address[field] !== "string" || !address[field].trim()) {
            return `${field} is required`
        }
    }
    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
        return "Enter a valid 10-digit Indian mobile number"
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
        return "Pincode must contain exactly 6 digits"
    }
    return null
}

export const createPaymentOrder = async (req, res) => {
    let shopKartOrder

    try {
        const { shippingAddress } = req.body
        const addressError = validateShippingAddress(shippingAddress)
        if (addressError) {
            return res.status(400).json({ success: false, message: addressError })
        }

        const customer = await Customer.findById(req.customer._id)
        if (!customer) {
            return res.status(401).json({ success: false, message: "Customer not found" })
        }
        if (!Array.isArray(customer.cart) || customer.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" })
        }

        const orderItems = []
        let totalAmount = 0

        for (const cartItem of customer.cart) {
            const productId = cartItem.product?._id || cartItem.product
            if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ success: false, message: "Cart contains an invalid product" })
            }

            const product = await Product.findById(productId)
            if (!product) {
                return res.status(400).json({ success: false, message: "A product in your cart no longer exists" })
            }

            const quantity = Number(cartItem.quantity)
            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` })
            }
            if (quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}` })
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image || ""
            })
            totalAmount += product.price * quantity
        }

        totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return res.status(400).json({ success: false, message: "Unable to calculate a valid order total" })
        }

        shopKartOrder = await Order.create({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone: shippingAddress.phone.trim(),
                addressLine1: shippingAddress.addressLine1.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: shippingAddress.pincode.trim()
            },
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        })

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString()
        })

        shopKartOrder.razorpayOrderId = razorpayOrder.id
        await shopKartOrder.save()

        return res.status(201).json({
            success: true,
            message: "Payment order created",
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (error) {
        if (shopKartOrder?._id && !shopKartOrder.razorpayOrderId) {
            await Order.findByIdAndDelete(shopKartOrder._id).catch(() => {})
        }
        console.error("CREATE PAYMENT ORDER ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Could not create payment order. Check backend logs."
        })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification details are incomplete" })
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: "Invalid ShopKart order ID" })
        }

        const order = await Order.findOne({ _id: shopKartOrderId, user: req.customer._id })
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }
        if (order.paymentStatus === "PAID") {
            return res.status(200).json({ success: true, message: "Payment already verified", order })
        }
        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: "Razorpay order does not match" })
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex")

        const received = Buffer.from(razorpay_signature, "utf8")
        const expected = Buffer.from(expectedSignature, "utf8")
        if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" })
        }

        const claimedOrder = await Order.findOneAndUpdate(
            { _id: shopKartOrderId, user: req.customer._id, paymentStatus: "PENDING" },
            {
                $set: {
                    paymentStatus: "PAID",
                    status: "PLACED",
                    razorpayPaymentId: razorpay_payment_id
                }
            },
            { new: true }
        )

        if (!claimedOrder) {
            const currentOrder = await Order.findOne({ _id: shopKartOrderId, user: req.customer._id })
            if (currentOrder?.paymentStatus === "PAID") {
                return res.status(200).json({ success: true, message: "Payment already verified", order: currentOrder })
            }
            return res.status(400).json({ success: false, message: "Order cannot be verified in current state" })
        }

        for (const item of claimedOrder.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            })
        }

        await Customer.findByIdAndUpdate(req.customer._id, { $set: { cart: [] } })

        return res.status(200).json({ success: true, message: "Payment verified and order placed", order: claimedOrder })
    } catch (error) {
        console.error("Verify payment error:", error)
        return res.status(500).json({ success: false, message: "Could not verify payment" })
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.customer._id }).sort({ createdAt: -1 })
        return res.status(200).json({ success: true, orders })
    } catch (error) {
        console.error("Get orders error:", error)
        return res.status(500).json({ success: false, message: "Could not fetch orders" })
    }
}

export const getMyOrderById = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" })
        }

        const order = await Order.findById(id)
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }

        if (order.user.toString() !== req.customer._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied: You are not authorized to view this order" })
        }

        return res.status(200).json({ success: true, order })
    } catch (error) {
        console.error("Get order error:", error)
        return res.status(500).json({ success: false, message: "Could not fetch order" })
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        const allowedStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"]

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" })
        }

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
            })
        }

        const order = await Order.findById(id)
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }

        if (order.user.toString() !== req.customer._id.toString()) {
            return res.status(403).json({ success: false, message: "Access denied" })
        }

        order.status = status
        await order.save()

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        })
    } catch (error) {
        console.error("Update order status error:", error)
        return res.status(500).json({ success: false, message: "Could not update order status" })
    }
}
