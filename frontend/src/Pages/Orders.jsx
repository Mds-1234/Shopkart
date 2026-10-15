import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { getOrders } from "../Services/api.js"
import { API_BASE_URL } from "../config"

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
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
}

const Orders = ({ userData, setUserData }) => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [wishlistCount, setWishlistCount] = useState(0)

    const fetchWishlistCount = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/wishlist`, {
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

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true)
            setError("")
            const data = await getOrders()
            setOrders(data.orders || [])
        } catch (err) {
            console.error("Failed to load orders:", err)
            setError(err.message || "Failed to load order history")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchWishlistCount()
        loadOrders()
    }, [fetchWishlistCount, loadOrders])

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
                            Loading your orders...
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md w-full shadow-sm">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Unable to load orders
                        </h2>
                        <p className="text-sm text-slate-500 mt-2 mb-5">
                            {error}
                        </p>
                        <button
                            onClick={loadOrders}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                </main>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            No orders yet
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            You have not placed any orders yet. Discover our latest products and place your first order today!
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                        >
                            Browse Products
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {navbar}

            <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Order History
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Showing {orders.length} order{orders.length !== 1 ? "s" : ""}, newest first
                    </p>
                </div>

                <div className="space-y-6">
                    {orders.map((order) => {
                        const totalQuantity = (order.items || []).reduce(
                            (acc, item) => acc + (item.quantity || 0),
                            0
                        )

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300"
                            >
                                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                                Order ID
                                            </span>
                                            <span className="font-mono text-sm font-bold text-slate-900">
                                                #{order._id}
                                            </span>
                                        </div>

                                        <div className="hidden sm:block h-7 w-px bg-slate-200"></div>

                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                                Date Placed
                                            </span>
                                            <span className="text-sm text-slate-700">
                                                {formatDate(order.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusBadge(
                                                order.paymentStatus
                                            )}`}
                                        >
                                            Payment: {order.paymentStatus}
                                        </span>

                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="divide-y divide-slate-100">
                                        {(order.items || []).map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="text-slate-300 text-xs">No img</div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-semibold text-slate-900 truncate">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="text-xs text-slate-500">
                                            {order.shippingAddress && (
                                                <span>
                                                    Deliver to:{" "}
                                                    <span className="font-medium text-slate-700">
                                                        {order.shippingAddress.fullName}
                                                    </span>{" "}
                                                    ({order.shippingAddress.city}, {order.shippingAddress.state})
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6">
                                            <div>
                                                <span className="text-xs text-slate-400 block text-right">
                                                    Total ({totalQuantity} item{totalQuantity !== 1 ? "s" : ""})
                                                </span>
                                                <span className="text-lg font-bold text-slate-900">
                                                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                                </span>
                                            </div>

                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                                            >
                                                <span>View Details</span>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}

export default Orders
