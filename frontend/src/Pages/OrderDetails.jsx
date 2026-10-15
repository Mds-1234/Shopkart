import { useEffect, useState, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getOrderById, updateOrderStatus } from "../Services/api.js"

const progressionStages = [
    { key: "PLACED", label: "Order Placed" },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" }
]

const getStatusBadge = (status) => {
    switch (status) {
        case "DELIVERED":
            return "bg-emerald-100 text-emerald-800 border-emerald-300"
        case "PLACED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "CONFIRMED":
        case "SHIPPED":
            return "bg-indigo-50 text-indigo-700 border-indigo-200"
        case "PENDING_PAYMENT":
            return "bg-amber-50 text-amber-700 border-amber-200"
        default:
            return "bg-slate-100 text-slate-700 border-slate-200"
    }
}

const getPaymentStatusBadge = (status) => {
    switch (status) {
        case "PAID":
            return "bg-emerald-50 text-emerald-700 border-emerald-200"
        case "PENDING":
            return "bg-amber-50 text-amber-700 border-amber-200"
        case "FAILED":
            return "bg-rose-50 text-rose-700 border-rose-200"
        default:
            return "bg-slate-100 text-slate-700 border-slate-200"
    }
}

const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

const OrderDetails = ({ userData, setUserData }) => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [errorStatus, setErrorStatus] = useState(null)
    const [wishlistCount, setWishlistCount] = useState(0)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [statusSuccessMessage, setStatusSuccessMessage] = useState("")

    const fetchWishlistCount = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8085/wishlist", {
                credentials: "include"
            })
            if (response.ok) {
                const data = await response.json()
                setWishlistCount(data.wishlist?.length || 0)
            }
        } catch (err) {
            console.error("Failed to load wishlist count:", err)
        }
    }, [])

    const loadOrder = useCallback(async () => {
        if (!id) return
        try {
            setLoading(true)
            setError("")
            setErrorStatus(null)

            const data = await getOrderById(id)
            if (data.order) {
                setOrder(data.order)
            } else {
                throw new Error("Order data not found")
            }
        } catch (err) {
            console.error("Failed to load order details:", err)
            setError(err.message || "Failed to load order details")
            setErrorStatus(err.status || 500)
        } finally {
            setLoading(false)
        }
    }, [id])

    const handleStatusChange = async (newStatus) => {
        if (updatingStatus || !order) return
        try {
            setUpdatingStatus(true)
            setStatusSuccessMessage("")
            const data = await updateOrderStatus(order._id, newStatus)
            if (data.success && data.order) {
                setOrder(data.order)
                setStatusSuccessMessage(`Status updated to ${newStatus}`)
                setTimeout(() => setStatusSuccessMessage(""), 3000)
            }
        } catch (err) {
            console.error("Status update error:", err)
            alert(err.message || "Failed to update status")
        } finally {
            setUpdatingStatus(false)
        }
    }

    useEffect(() => {
        fetchWishlistCount()
        loadOrder()
    }, [fetchWishlistCount, loadOrder])

    const navbar = (
        <Navbar
            userData={userData}
            setUserData={setUserData}
            wishlistCount={wishlistCount}
        />
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-medium text-slate-600">
                            Loading order details...
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            {errorStatus === 403
                                ? "Unauthorized Access"
                                : errorStatus === 404
                                ? "Order Not Found"
                                : errorStatus === 400
                                ? "Invalid Order ID"
                                : "Unable to Load Order"}
                        </h2>

                        <p className="text-sm text-slate-500 mt-2 mb-6">
                            {error || "We couldn't retrieve the requested order."}
                        </p>

                        <div className="flex flex-col gap-2.5">
                            {errorStatus !== 403 && errorStatus !== 404 && errorStatus !== 400 && (
                                <button
                                    onClick={loadOrder}
                                    className="w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                                >
                                    Try Again
                                </button>
                            )}
                            <Link
                                to="/orders"
                                className="w-full px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Orders</span>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    const { shippingAddress, items = [] } = order
    const totalQuantity = items.reduce((acc, it) => acc + (it.quantity || 0), 0)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {navbar}

            <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/orders"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Order History</span>
                    </Link>

                    <button
                        onClick={() => navigate("/products")}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Continue Shopping →
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Order Details
                            </h1>
                            <span className="font-mono text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                                #{order._id}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusBadge(
                                order.paymentStatus
                            )}`}
                        >
                            Payment: {order.paymentStatus}
                        </span>

                        <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                order.status
                            )}`}
                        >
                            Order Status: {order.status}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-6">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Order Tracking & Progression
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Current stage: <span className="font-semibold text-indigo-600">{order.status}</span>
                            </p>
                        </div>
                        {statusSuccessMessage && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                {statusSuccessMessage}
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {progressionStages.map((stage, idx) => {
                                const stageIndex = progressionStages.findIndex(s => s.key === order.status)
                                const isPassed = stageIndex >= 0 && stageIndex >= idx
                                const isCurrent = order.status === stage.key

                                return (
                                    <div
                                        key={stage.key}
                                        className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                                            isCurrent
                                                ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200"
                                                : isPassed
                                                ? "bg-emerald-50/60 border-emerald-200"
                                                : "bg-slate-50 border-slate-200 opacity-60"
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 ${
                                                isPassed
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-200 text-slate-600"
                                            }`}
                                        >
                                            {isPassed ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                idx + 1
                                            )}
                                        </div>
                                        <span className={`text-xs font-semibold ${isCurrent ? "text-indigo-900 font-bold" : "text-slate-800"}`}>
                                            {stage.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                            {stage.key}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-3.5 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium">
                            Status Progression Control (Bonus Challenge):
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {progressionStages.map((stage) => (
                                <button
                                    key={stage.key}
                                    type="button"
                                    disabled={updatingStatus || order.status === stage.key}
                                    onClick={() => handleStatusChange(stage.key)}
                                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition cursor-pointer disabled:cursor-not-allowed ${
                                        order.status === stage.key
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                                    }`}
                                >
                                    {stage.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Items Ordered ({totalQuantity})</span>
                                <span className="text-xs font-normal text-slate-500">
                                    Purchase-time snapshots
                                </span>
                            </h2>

                            <div className="divide-y divide-slate-100">
                                {items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-slate-300 text-xs">No image</div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="text-base font-semibold text-slate-900 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Unit Price: ₹{Number(item.price).toLocaleString("en-IN")}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Quantity: {item.quantity}
                                                </p>

                                                {item.product && (
                                                    <Link
                                                        to={`/products/${item.product?._id || item.product}`}
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2"
                                                    >
                                                        <span>View Product</span>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <span className="text-xs text-slate-400 block sm:inline">
                                                Subtotal:{" "}
                                            </span>
                                            <span className="text-base font-bold text-slate-900">
                                                ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                Order & Payment Identifiers
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        ShopKart Order ID
                                    </span>
                                    <span className="font-mono text-xs sm:text-sm font-medium text-slate-800 break-all">
                                        {order._id}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Razorpay Order ID
                                    </span>
                                    <span className="font-mono text-xs sm:text-sm font-medium text-slate-800 break-all">
                                        {order.razorpayOrderId || "N/A (Payment pending)"}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Razorpay Payment ID
                                    </span>
                                    <span className="font-mono text-xs sm:text-sm font-medium text-slate-800 break-all">
                                        {order.razorpayPaymentId || "N/A (Not captured yet)"}
                                    </span>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Payment Status
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                        {order.paymentStatus === "PAID"
                                            ? "Verified & Paid"
                                            : order.paymentStatus === "FAILED"
                                            ? "Payment Failed"
                                            : "Awaiting Verification"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Shipping Address</span>
                            </h2>

                            {shippingAddress ? (
                                <div className="space-y-3 text-sm text-slate-700">
                                    <div>
                                        <span className="text-xs text-slate-400 block">Recipient</span>
                                        <span className="font-semibold text-slate-900 text-base">
                                            {shippingAddress.fullName}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-xs text-slate-400 block">Phone</span>
                                        <span className="font-medium text-slate-800">
                                            +91 {shippingAddress.phone}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-xs text-slate-400 block">Address</span>
                                        <span className="text-slate-800">
                                            {shippingAddress.addressLine1}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-xs text-slate-400 block">City & State</span>
                                        <span className="text-slate-800">
                                            {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No address recorded</p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                Order Summary
                            </h2>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Items Subtotal</span>
                                    <span>₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                                </div>

                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 font-medium">FREE</span>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-bold text-slate-900">
                                    <span>Total Paid</span>
                                    <span className="text-indigo-600">
                                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
                                <div className="text-xs text-slate-500 flex items-center justify-between">
                                    <span>Payment Gateway</span>
                                    <span className="font-medium text-slate-700">Razorpay</span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center justify-between">
                                    <span>Currency</span>
                                    <span className="font-medium text-slate-700">INR (₹)</span>
                                </div>
                            </div>

                            <Link
                                to="/orders"
                                className="w-full mt-6 h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center transition-colors"
                            >
                                All Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default OrderDetails
