import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCart } from "../Context/CartContext.jsx"
import { createPaymentOrder, verifyPayment } from "../Services/api.js"

const initialForm = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
}

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }

        const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        )
        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true))
            existingScript.addEventListener("error", () => resolve(false))
            return
        }

        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

const Checkout = ({ userData, setUserData }) => {
    const { cartItems, cartLoading, cartError, subtotal, refreshCart, clearCart } = useCart()

    const [wishlistCount, setWishlistCount] = useState(0)
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("error")
    const [isProcessing, setIsProcessing] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(null)

    useEffect(() => {
        loadRazorpayScript()

        const fetchWishlistCount = async () => {
            try {
                const response = await fetch("http://localhost:8085/wishlist", {
                    credentials: "include"
                })

                if (!response.ok) return

                const data = await response.json()
                setWishlistCount(data.wishlist?.length || 0)
            } catch (error) {
                console.error(error)
            }
        }

        fetchWishlistCount()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }))

        setMessage("")
    }

    const validateForm = () => {
        const newErrors = {}

        Object.entries(form).forEach(([key, value]) => {
            if (!value.trim()) {
                newErrors[key] = "This field is required"
            }
        })

        if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit Indian mobile number"
        }

        if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) {
            newErrors.pincode = "Pincode must contain exactly 6 digits"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isProcessing) return

        setMessage("")

        if (!validateForm()) {
            setMessageType("error")
            setMessage("Please correct the errors in the form.")
            return
        }

        setIsProcessing(true)

        try {
            const isLoaded = await loadRazorpayScript()
            if (!isLoaded) {
                setMessageType("error")
                setMessage("Failed to load Razorpay payment gateway. Please check your internet connection.")
                setIsProcessing(false)
                return
            }

            const paymentOrder = await createPaymentOrder({
                fullName: form.fullName.trim(),
                phone: form.phone.trim(),
                addressLine1: form.addressLine1.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim()
            })

            if (!paymentOrder.success || !paymentOrder.razorpayOrderId || !paymentOrder.key) {
                throw new Error(paymentOrder.message || "Failed to initialize payment order.")
            }

            const options = {
                key: paymentOrder.key,
                amount: paymentOrder.amount,
                currency: paymentOrder.currency || "INR",
                name: "ShopKart",
                description: "Order Payment",
                order_id: paymentOrder.razorpayOrderId,
                prefill: {
                    name: form.fullName.trim(),
                    contact: form.phone.trim(),
                    email: userData?.email || ""
                },
                theme: {
                    color: "#4f46e5"
                },
                handler: async function (response) {
                    try {
                        setMessage("Payment received. Verifying payment...")
                        setMessageType("success")

                        const verifyRes = await verifyPayment({
                            shopKartOrderId: paymentOrder.shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })

                        if (verifyRes.success) {
                            if (clearCart) {
                                clearCart()
                            }
                            await refreshCart()

                            setOrderSuccess({
                                orderId: verifyRes.order?._id || paymentOrder.shopKartOrderId,
                                razorpayPaymentId: response.razorpay_payment_id,
                                totalAmount: verifyRes.order?.totalAmount || (paymentOrder.amount / 100),
                                order: verifyRes.order
                            })
                            setMessageType("success")
                            setMessage("Payment verified successfully!")
                        } else {
                            throw new Error(verifyRes.message || "Payment verification failed.")
                        }
                    } catch (verifyErr) {
                        console.error("Payment verification failed:", verifyErr)
                        setMessageType("error")
                        setMessage(verifyErr.message || "Payment verification failed. Please contact support.")
                    } finally {
                        setIsProcessing(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false)
                        setMessageType("error")
                        setMessage("Payment was cancelled. You can retry when ready.")
                    }
                }
            }

            const rzp = new window.Razorpay(options)

            rzp.on("payment.failed", function (failResponse) {
                setIsProcessing(false)
                setMessageType("error")
                setMessage(
                    failResponse?.error?.description ||
                    failResponse?.error?.reason ||
                    "Payment failed. Please try again."
                )
            })

            rzp.open()
        } catch (error) {
            console.error("Payment creation error:", error)
            setMessageType("error")
            setMessage(error.message || "Could not proceed to payment. Please try again.")
            setIsProcessing(false)
        }
    }

    const navbar = (
        <Navbar
            userData={userData}
            setUserData={setUserData}
            wishlistCount={wishlistCount}
        />
    )

    const inputFields = [
        { name: "fullName", label: "Full Name", placeholder: "Enter your full name" },
        { name: "phone", label: "Phone Number", placeholder: "10-digit mobile number" },
        { name: "addressLine1", label: "Address Line", placeholder: "House number, street, area" },
        { name: "city", label: "City", placeholder: "Enter your city" },
        { name: "state", label: "State", placeholder: "Enter your state" },
        { name: "pincode", label: "Pincode", placeholder: "6-digit pincode" }
    ]

    if (cartLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                {navbar}
                <div className="flex min-h-[60vh] items-center justify-center">
                    <p className="text-slate-600">Loading checkout...</p>
                </div>
            </div>
        )
    }

    if (cartError) {
        return (
            <div className="min-h-screen bg-slate-50">
                {navbar}
                <div className="mx-auto max-w-xl px-4 py-16 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Unable to load your cart
                    </h1>
                    <p className="mt-3 text-slate-600">{cartError}</p>
                    <button
                        onClick={refreshCart}
                        className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-slate-50">
                {navbar}
                <div className="mx-auto max-w-xl px-4 py-20 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900">
                        Order Placed Successfully!
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Thank you for your purchase. Your payment has been verified and your order is confirmed.
                    </p>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Order Reference</span>
                                <span className="font-mono font-medium text-slate-800">
                                    {orderSuccess.orderId}
                                </span>
                            </div>
                            {orderSuccess.razorpayPaymentId && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment ID</span>
                                    <span className="font-mono font-medium text-slate-800">
                                        {orderSuccess.razorpayPaymentId}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-slate-100 pt-3">
                                <span className="font-semibold text-slate-900">Total Paid</span>
                                <span className="font-bold text-slate-900">
                                    ₹{Number(orderSuccess.totalAmount).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to={`/orders/${orderSuccess.orderId}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
                        >
                            View Order Details
                        </Link>
                        <Link
                            to="/orders"
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Order History
                        </Link>
                        <Link
                            to="/products"
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg text-indigo-600 px-6 py-3 font-semibold hover:text-indigo-800"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50">
                {navbar}
                <div className="mx-auto max-w-xl px-4 py-20 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Your cart is empty
                    </h1>
                    <p className="mt-3 text-slate-600">
                        Add products to your cart before checking out.
                    </p>
                    <Link
                        to="/products"
                        className="mt-6 inline-flex rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {navbar}

            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Checkout
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Enter your shipping details and review your order.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                >
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <h2 className="mb-6 text-xl font-bold text-slate-900">
                            Shipping Details
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {inputFields.map(field => (
                                <div
                                    key={field.name}
                                    className={
                                        field.name === "addressLine1"
                                            ? "sm:col-span-2"
                                            : ""
                                    }
                                >
                                    <label
                                        htmlFor={field.name}
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        {field.label}
                                    </label>

                                    <input
                                        id={field.name}
                                        name={field.name}
                                        type="text"
                                        disabled={isProcessing}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-100 disabled:cursor-not-allowed ${
                                            errors[field.name]
                                                ? "border-red-500"
                                                : "border-slate-300 focus:border-indigo-500"
                                        }`}
                                    />

                                    {errors[field.name] && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors[field.name]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {message && (
                            <p
                                className={`mt-6 rounded-lg p-3 text-sm ${
                                    messageType === "success"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                }`}
                            >
                                {message}
                            </p>
                        )}
                    </section>

                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-xl font-bold text-slate-900">
                            Order Summary
                        </h2>

                        <div className="space-y-5">
                            {cartItems.map(item => {
                                const product = item.product

                                if (!product) return null

                                return (
                                    <div
                                        key={product._id}
                                        className="flex items-start justify-between gap-4"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                                            />

                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                        </div>

                                        <p className="shrink-0 font-semibold text-slate-900">
                                            ₹{(
                                                product.price * item.quantity
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-6 space-y-3 border-t border-slate-200 pt-5">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Total items</span>
                                <span>
                                    {cartItems.reduce(
                                        (total, item) => total + item.quantity,
                                        0
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between text-lg font-bold text-slate-900">
                                <span>Total</span>
                                <span>
                                    ₹{Number(subtotal).toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isProcessing ? (
                                <>
                                    <svg
                                        className="h-5 w-5 animate-spin text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                "Place Order"
                            )}
                        </button>

                        <Link
                            to="/cart"
                            className="mt-3 flex w-full justify-center rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to Cart
                        </Link>
                    </aside>
                </form>
            </main>
        </div>
    )
}

export default Checkout
