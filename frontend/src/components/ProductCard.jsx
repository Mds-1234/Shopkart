import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext.jsx';

const ProductCard = ({ product, isWishlisted = false, onWishlistToggle, userData }) => {
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState("");

    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    const showMessage = (type, text) => {
        setStatusMessage({ type, text });

        setTimeout(() => {
            setStatusMessage(null);
        }, 3000);
    };

    const handleWishlistClick = async (e) => {
        e.stopPropagation();

        if (saving) return;

        if (!userData) {
            navigate("/login");
            return;
        }

        setSaving(true);
        setStatusMessage(null);

        try {
            if (onWishlistToggle) {
                const success = await onWishlistToggle(
                    product._id,
                    isWishlisted
                );

                if (success) {
                    showMessage(
                        'success',
                        isWishlisted
                            ? 'Removed from Wishlist'
                            : '♥ Added to Wishlist'
                    );
                }
            }
        } catch (err) {
            console.error("Wishlist action error:", err);

            showMessage(
                'error',
                err.message || 'Unable to save product. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();

        if (!userData) {
            navigate("/login");
            return;
        }

        if (adding || isOutOfStock) return;

        setAdding(true);
        setAddError("");

        try {
            const result = await addToCart(product._id);

            if (!result.success) {
                setAddError(result.message);
            } else {
                showMessage(
                    'success',
                    'Added to Cart'
                );
            }
        } catch (err) {
            console.error("Add to cart error:", err);

            setAddError(
                err.message || "Unable to add product to cart"
            );
        } finally {
            setAdding(false);
        }
    };

    return (
        <div
            onClick={() => navigate(`/products/${product._id}`)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
        >
            <div className="relative aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-4 border-b border-slate-100">

                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />

                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs border border-slate-200/80">
                    {product.category}
                </span>

                <button
                    onClick={handleWishlistClick}
                    disabled={saving}
                    title={
                        isWishlisted
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                    }
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                        isWishlisted
                            ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            : "bg-white/90 backdrop-blur-xs text-slate-400 hover:text-red-500 border border-slate-200/80 hover:bg-white"
                    } ${
                        saving
                            ? "opacity-70 cursor-wait"
                            : ""
                    }`}
                >
                    {saving ? (
                        <svg
                            className="w-4 h-4 animate-spin text-slate-500"
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
                            className={`w-4 h-4 transition-transform active:scale-125 ${
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

                <span
                    className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOutOfStock
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : isLowStock
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    }`}
                >
                    {isOutOfStock
                        ? "Out of Stock"
                        : isLowStock
                        ? `Only ${product.stock} Left`
                        : "In Stock"}
                </span>
            </div>

            {statusMessage && (
                <div
                    className={`px-3 py-1.5 text-xs text-center font-medium transition-all ${
                        statusMessage.type === 'error'
                            ? "bg-red-100 text-red-700 border-b border-red-200"
                            : "bg-emerald-100 text-emerald-800 border-b border-emerald-200"
                    }`}
                >
                    {statusMessage.text}
                </div>
            )}

            {addError && (
                <div className="px-3 py-2 text-xs text-center font-medium bg-red-100 text-red-700 border-b border-red-200">
                    {addError}
                </div>
            )}

            <div className="p-5 flex-1 flex flex-col justify-between">

                <div>
                    <h2
                        className="font-semibold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors"
                        title={product.name}
                    >
                        {product.name}
                    </h2>

                    <div className="mt-3 flex items-baseline justify-between">
                        <div className="text-xl font-bold text-slate-900">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </div>

                        <div className="text-xs text-slate-500 font-medium">
                            {product.stock} units left
                        </div>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product._id}`);
                        }}
                        className="h-10 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                        View Details
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={adding || isOutOfStock}
                        className={`h-10 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                            isOutOfStock
                                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                : adding
                                ? "bg-indigo-100 text-indigo-600 border border-indigo-200 cursor-wait"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                        {adding ? (
                            <span>Adding...</span>
                        ) : isOutOfStock ? (
                            <span>Out of Stock</span>
                        ) : (
                            <span>Add to Cart</span>
                        )}
                    </button>

                    <button
                        onClick={handleWishlistClick}
                        disabled={saving}
                        className={`h-10 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                            saving
                                ? "bg-slate-100 text-slate-500 border border-slate-200 cursor-wait"
                                : isWishlisted
                                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                : "bg-slate-900 hover:bg-indigo-600 text-white"
                        }`}
                    >
                        {saving ? (
                            <span>⏳ Saving...</span>
                        ) : isWishlisted ? (
                            <>
                                <svg
                                    className="w-3.5 h-3.5 fill-red-600 text-red-600"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                    />
                                </svg>

                                <span>Saved</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    className="w-3.5 h-3.5 fill-none text-current"
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

                                <span>Wishlist</span>
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ProductCard;