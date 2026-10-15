import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import { useCart } from "../Context/CartContext.jsx"

const Cart = ({ userData, setUserData }) => {
    const {
        cartItems,
        cartLoading,
        cartError,
        totalItems,
        subtotal,
        updateCartQuantity,
        removeFromCart,
        refreshCart
    } = useCart()

    const [wishlistCount, setWishlistCount] = useState(0)

    const fetchWishlistCount = async () => {
        try {
            const response = await fetch(
                "http://localhost:8085/wishlist",
                {
                    method: "GET",
                    credentials: "include"
                }
            )

            if (!response.ok) {
                return
            }

            const data = await response.json()

            setWishlistCount(data.wishlist?.length || 0)

        } catch (error) {
            console.log("Failed to load wishlist count:", error)
        }
    }

    useEffect(() => {
        fetchWishlistCount()
    }, [])

    const handleIncrease = async (item) => {
        if (item.quantity >= item.product.stock) {
            return
        }

        await updateCartQuantity(
            item.product._id,
            item.quantity + 1
        )
    }

    const handleDecrease = async (item) => {
        if (item.quantity <= 1) {
            return
        }

        await updateCartQuantity(
            item.product._id,
            item.quantity - 1
        )
    }

    const handleRemove = async (productId) => {
        await removeFromCart(productId)
    }

    const navbar = (
        <Navbar
            userData={userData}
            setUserData={setUserData}
            wishlistCount={wishlistCount}
        />
    )

    if (cartLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}

                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>

                        <p className="text-sm font-medium text-slate-600">
                            Loading your cart...
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    if (cartError) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}

                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="bg-white border border-red-200 rounded-2xl p-8 text-center max-w-md w-full shadow-sm">

                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                                />
                            </svg>
                        </div>

                        <h2 className="text-lg font-bold text-slate-900">
                            Unable to load your cart.
                        </h2>

                        <p className="text-sm text-slate-500 mt-2 mb-5">
                            {cartError}
                        </p>

                        <button
                            onClick={refreshCart}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>

                    </div>
                </main>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                {navbar}

                <main className="flex-1 flex items-center justify-center px-4">

                    <div className="text-center">

                        <div className="text-6xl mb-4">
                            🛒
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Your cart is empty
                        </h1>

                        <p className="text-sm text-slate-500 mt-2">
                            Looks like you haven't added anything yet.
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

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        My Cart
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
                    </p>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-4">

                        {cartItems.map((item) => {

                            const product = item.product

                            return (
                                <div
                                    key={product._id}
                                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm"
                                >

                                    <div className="flex gap-4">

                                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-xl border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">

                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-contain"
                                            />

                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <div className="flex justify-between gap-3">

                                                <div>

                                                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                                                        {product.name}
                                                    </h2>

                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {product.category}
                                                    </p>

                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleRemove(product._id)
                                                    }
                                                    className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                                <div className="flex items-center gap-3">

                                                    <span className="text-xs font-semibold text-slate-500">
                                                        Quantity
                                                    </span>

                                                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">

                                                        <button
                                                            onClick={() =>
                                                                handleDecrease(item)
                                                            }
                                                            disabled={
                                                                item.quantity <= 1
                                                            }
                                                            className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            -
                                                        </button>

                                                        <span className="w-10 text-center text-sm font-semibold text-slate-800">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                handleIncrease(item)
                                                            }
                                                            disabled={
                                                                item.quantity >= product.stock
                                                            }
                                                            className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                    <span className="text-xs text-slate-400">
                                                        {product.stock} available
                                                    </span>

                                                </div>

                                                <div className="text-right">

                                                    <p className="text-xs text-slate-400">
                                                        ₹{Number(product.price).toLocaleString("en-IN")} × {item.quantity}
                                                    </p>

                                                    <p className="text-lg font-bold text-slate-900">
                                                        ₹{Number(
                                                            product.price * item.quantity
                                                        ).toLocaleString("en-IN")}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )
                        })}

                    </div>

                    <div className="lg:col-span-1">

                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24">

                            <h2 className="text-lg font-bold text-slate-900">
                                Order Summary
                            </h2>

                            <div className="mt-5 space-y-3">

                                <div className="flex justify-between text-sm">

                                    <span className="text-slate-500">
                                        Items
                                    </span>

                                    <span className="font-medium text-slate-900">
                                        {totalItems}
                                    </span>

                                </div>

                                <div className="flex justify-between text-sm">

                                    <span className="text-slate-500">
                                        Subtotal
                                    </span>

                                    <span className="font-semibold text-slate-900">
                                        ₹{Number(subtotal).toLocaleString("en-IN")}
                                    </span>

                                </div>

                            </div>

                            <div className="border-t border-slate-200 mt-5 pt-5">

                                <div className="flex justify-between">

                                    <span className="font-bold text-slate-900">
                                        Subtotal
                                    </span>

                                    <span className="text-xl font-bold text-slate-900">
                                        ₹{Number(subtotal).toLocaleString("en-IN")}
                                    </span>

                                </div>

                            </div>

                            <Link
                                to="/checkout"
                                className="w-full mt-5 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center transition-colors"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link
                                to="/products"
                                className="w-full mt-3 h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center justify-center transition-colors"
                            >
                                Continue Shopping
                            </Link>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    )
}

export default Cart