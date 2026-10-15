import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../Context/CartContext.jsx';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;

const ProductDetails = ({ userData, setUserData }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, updateCartQuantity, cartItems } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addedToCart, setAddedToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [wishlistSaving, setWishlistSaving] = useState(false);
    const [wishlistMessage, setWishlistMessage] = useState(null);

    const fetchUserWishlist = useCallback(async () => {
        if (!userData) return;

        try {
            const res = await fetch(`${BASE_URL}/wishlist`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json().catch(() => ({}));

                if (data && data.wishlist) {
                    setWishlistCount(data.wishlist.length);

                    const found = data.wishlist.some(
                        (item) => (item._id || item) === id
                    );

                    setIsWishlisted(found);
                }
            }
        } catch (err) {
            console.error(
                "Failed to load wishlist in details:",
                err
            );
        }
    }, [userData, id]);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${BASE_URL}/products/${id}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Product not found");
                }

                throw new Error(
                    "Failed to fetch product details"
                );
            }

            const data = await response.json();

            setProduct(data.product);
        } catch (err) {
            setError(
                err.message || "Failed to load product"
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
        fetchUserWishlist();
    }, [fetchProduct, fetchUserWishlist]);

    const showWishlistMessage = (type, text) => {
        setWishlistMessage({
            type,
            text
        });

        setTimeout(() => {
            setWishlistMessage(null);
        }, 3000);
    };

    const handleWishlistToggle = async () => {
        if (!userData) {
            navigate("/login");
            return;
        }

        if (wishlistSaving) return;

        setWishlistSaving(true);
        setWishlistMessage(null);

        try {
            if (isWishlisted) {

                const res = await fetch(
                    `${BASE_URL}/wishlist/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    }
                );

                const data = await res
                    .json()
                    .catch(() => ({}));

                if (!res.ok) {
                    throw new Error(
                        data.message ||
                        "Unable to remove product from wishlist"
                    );
                }

                setIsWishlisted(false);

                setWishlistCount(
                    (prev) => Math.max(0, prev - 1)
                );

                showWishlistMessage(
                    'success',
                    'Removed from Wishlist'
                );

            } else {

                const res = await fetch(
                    `${BASE_URL}/wishlist/${id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    }
                );

                const data = await res
                    .json()
                    .catch(() => ({}));

                if (res.status === 409) {

                    setIsWishlisted(true);

                    showWishlistMessage(
                        'success',
                        'Already in Wishlist'
                    );

                } else if (!res.ok) {

                    throw new Error(
                        data.message ||
                        "Unable to save product. Please try again."
                    );

                } else {

                    setIsWishlisted(true);

                    setWishlistCount(
                        (prev) => prev + 1
                    );

                    showWishlistMessage(
                        'success',
                        'Added to Wishlist'
                    );
                }
            }

        } catch (err) {

            console.error(
                "Wishlist action failed:",
                err
            );

            showWishlistMessage(
                'error',
                err.message ||
                'Unable to save product. Please try again.'
            );

        } finally {
            setWishlistSaving(false);
        }
    };

    const handleAddToCart = async () => {
        if (!userData) {
            navigate("/login");
            return;
        }

        if (!product || product.stock <= 0) return;

        try {
            const existingItem = cartItems?.find(
                item => (item.product?._id || item.product) === product._id
            );

            let res;
            if (existingItem) {
                const targetQty = Math.min(product.stock, existingItem.quantity + quantity);
                res = await updateCartQuantity(product._id, targetQty);
            } else {
                res = await addToCart(product._id);
                if (res?.success && quantity > 1) {
                    await updateCartQuantity(product._id, Math.min(product.stock, quantity));
                }
            }

            if (res?.success) {
                setAddedToCart(true);
                setTimeout(() => {
                    setAddedToCart(false);
                }, 2500);
            } else {
                showWishlistMessage('error', res?.message || "Failed to add to cart");
            }
        } catch (err) {
            console.error("Add to cart error:", err);
            showWishlistMessage('error', err.message || "Failed to add to cart");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            <Navbar
                userData={userData}
                setUserData={setUserData}
                wishlistCount={wishlistCount}
            />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">

                    {userData && (
                        <>
                            <Link
                                to="/home"
                                className="hover:text-slate-900 transition-colors"
                            >
                                Home
                            </Link>

                            <span>/</span>
                        </>
                    )}

                    <Link
                        to="/products"
                        className="hover:text-slate-900 transition-colors"
                    >
                        Products
                    </Link>

                    <span>/</span>

                    <span className="text-slate-900 truncate max-w-[200px] sm:max-w-md">
                        {loading
                            ? "Loading..."
                            : product?.name}
                    </span>

                </div>

                {loading ? (

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 animate-pulse">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">

                            <div className="aspect-square bg-slate-200 rounded-2xl w-full" />

                            <div className="space-y-4">

                                <div className="h-5 bg-slate-200 rounded-full w-24" />

                                <div className="h-8 bg-slate-200 rounded-lg w-3/4" />

                                <div className="h-6 bg-slate-200 rounded-md w-1/3" />

                                <div className="h-24 bg-slate-200 rounded-xl w-full" />

                                <div className="h-11 bg-slate-200 rounded-xl w-full" />

                            </div>

                        </div>

                    </div>

                ) : error ? (

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center max-w-md mx-auto my-12">

                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">

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
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>

                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                            Unable to Display Product
                        </h3>

                        <p className="text-xs text-red-600 mt-1 mb-5">
                            {error}
                        </p>

                        <div className="flex justify-center gap-3">

                            <button
                                onClick={fetchProduct}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                                Try Again
                            </button>

                            <button
                                onClick={() => navigate("/products")}
                                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                                Browse Products
                            </button>

                        </div>

                    </div>

                ) : !product ? null : (

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">

                            <div className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-8 flex items-center justify-center group">

                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                />

                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs border border-slate-200">
                                    {product.category}
                                </span>

                                <button
                                    onClick={handleWishlistToggle}
                                    disabled={wishlistSaving}
                                    title={
                                        isWishlisted
                                            ? "Remove from Wishlist"
                                            : "Add to Wishlist"
                                    }
                                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                                        isWishlisted
                                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                            : "bg-white/90 backdrop-blur-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:bg-white"
                                    } ${
                                        wishlistSaving
                                            ? "opacity-70 cursor-wait"
                                            : ""
                                    }`}
                                >

                                    {wishlistSaving ? (

                                        <svg
                                            className="w-5 h-5 animate-spin text-slate-500"
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
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>

                                    ) : (

                                        <svg
                                            className={`w-5 h-5 transition-transform active:scale-125 ${
                                                isWishlisted
                                                    ? "fill-red-500 text-red-500"
                                                    : "fill-none text-current"
                                            }`}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                            />
                                        </svg>

                                    )}

                                </button>

                            </div>

                            <div className="flex flex-col justify-between h-full space-y-6">

                                <div>

                                    <div className="flex items-center gap-2 mb-3">

                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                product.stock <= 0
                                                    ? "bg-red-50 text-red-600 border border-red-200"
                                                    : product.stock <= 5
                                                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                                                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            }`}
                                        >
                                            {product.stock <= 0
                                                ? "Out of Stock"
                                                : product.stock <= 5
                                                ? `Low Stock: Only ${product.stock} Left`
                                                : `In Stock (${product.stock} units)`}
                                        </span>

                                    </div>

                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                        {product.name}
                                    </h1>

                                    <div className="mt-4 flex items-baseline gap-3 pb-6 border-b border-slate-100">

                                        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </span>

                                        <span className="text-xs text-slate-400 font-medium">
                                            Inclusive of all taxes
                                        </span>

                                    </div>

                                    {wishlistMessage && (
                                        <div
                                            className={`my-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                                                wishlistMessage.type === 'error'
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            }`}
                                        >
                                            <span>
                                                {wishlistMessage.text}
                                            </span>
                                        </div>
                                    )}

                                    <div className="py-6 border-b border-slate-100">

                                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Description
                                        </h2>

                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {product.description || "No description provided for this product."}
                                        </p>

                                    </div>

                                    {product.stock > 0 && (

                                        <div className="py-5 border-b border-slate-100 flex items-center gap-4">

                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Quantity:
                                            </span>

                                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">

                                                <button
                                                    onClick={() =>
                                                        setQuantity(
                                                            Math.max(
                                                                1,
                                                                quantity - 1
                                                            )
                                                        )
                                                    }
                                                    disabled={quantity <= 1}
                                                    className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                >
                                                    -
                                                </button>

                                                <span className="w-12 text-center text-sm font-semibold text-slate-800">
                                                    {quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        setQuantity(
                                                            Math.min(
                                                                product.stock,
                                                                quantity + 1
                                                            )
                                                        )
                                                    }
                                                    disabled={
                                                        quantity >= product.stock
                                                    }
                                                    className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                >
                                                    +
                                                </button>

                                            </div>

                                            <span className="text-xs text-slate-400">
                                                (Max {product.stock})
                                            </span>

                                        </div>

                                    )}

                                </div>

                                <div className="space-y-3 pt-2">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.stock <= 0}
                                            className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
                                                product.stock <= 0
                                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                    : addedToCart
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                                            }`}
                                        >

                                            {addedToCart ? (
                                                <>
                                                    <svg
                                                        className="w-5 h-5 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                             strokeLinecap="round"
                                                             strokeLinejoin="round"
                                                             strokeWidth="2"
                                                             d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>

                                                    <span>
                                                        Added to Cart!
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="w-5 h-5 fill-none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                    </svg>

                                                    <span>
                                                        {product.stock <= 0
                                                            ? "Out of Stock"
                                                            : "Add to Cart"}
                                                    </span>
                                                </>
                                            )}

                                        </button>

                                        <button
                                            onClick={handleWishlistToggle}
                                            disabled={wishlistSaving}
                                            className={`h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                                                wishlistSaving
                                                    ? "bg-slate-100 text-slate-500 border-slate-200 cursor-wait"
                                                    : isWishlisted
                                                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                                            }`}
                                        >

                                            {wishlistSaving ? (

                                                <span>
                                                    ⏳ Saving...
                                                </span>

                                            ) : isWishlisted ? (

                                                <>
                                                    <svg
                                                        className="w-5 h-5 fill-red-600 text-red-600"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                                        />
                                                    </svg>

                                                    <span>
                                                        In Wishlist
                                                    </span>
                                                </>

                                            ) : (

                                                <>
                                                    <svg
                                                        className="w-5 h-5 fill-none text-current"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                                        />
                                                    </svg>

                                                    <span>
                                                        Add to Wishlist
                                                    </span>
                                                </>

                                            )}

                                        </button>

                                    </div>

                                    <button
                                        onClick={() => navigate("/products")}
                                        className="w-full h-11 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        Browse More Products
                                    </button>

                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">

                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">

                                        <svg
                                            className="w-5 h-5 mx-auto text-indigo-600 mb-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>

                                        <div className="text-[11px] font-semibold text-slate-800">
                                            100% Authentic
                                        </div>

                                        <div className="text-[9px] text-slate-400">
                                            Guaranteed Quality
                                        </div>

                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">

                                        <svg
                                            className="w-5 h-5 mx-auto text-indigo-600 mb-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>

                                        <div className="text-[11px] font-semibold text-slate-800">
                                            7 Days Return
                                        </div>

                                        <div className="text-[9px] text-slate-400">
                                            Hassle-Free Policy
                                        </div>

                                    </div>

                                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">

                                        <svg
                                            className="w-5 h-5 mx-auto text-indigo-600 mb-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>

                                        <div className="text-[11px] font-semibold text-slate-800">
                                            Secure Payment
                                        </div>

                                        <div className="text-[9px] text-slate-400">
                                            Encrypted Checkout
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
};

export default ProductDetails;