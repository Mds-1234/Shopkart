import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WishlistCard = ({ product, onRemove }) => {
    const navigate = useNavigate();
    const [removing, setRemoving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    const handleRemove = async (e) => {
        e.stopPropagation();
        if (removing) return;

        setRemoving(true);
        setErrorMessage("");

        try {
            await onRemove(product._id);
        } catch (err) {
            console.error("Failed to remove item:", err);
            setErrorMessage(err.message || "Failed to remove item");
            setRemoving(false);
        }
    };

    return (
        <div
            onClick={() => navigate(`/products/${product._id}`)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-red-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
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
                    onClick={handleRemove}
                    disabled={removing}
                    title="Remove from Wishlist"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-red-500 hover:bg-red-50 hover:text-red-700 border border-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                >
                    {removing ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 fill-red-500" viewBox="0 0 24 24">
                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
                    {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${product.stock} Left` : `${product.stock} units left`}
                </span>
            </div>

            {errorMessage && (
                <div className="bg-red-50 text-red-700 text-xs px-3 py-1.5 border-b border-red-200 text-center">
                    {errorMessage}
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
                            {product.category}
                        </div>
                    </div>
                </div>

                <div className="mt-5 space-y-2 pt-2 border-t border-slate-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product._id}`);
                        }}
                        className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                        <span>View Details</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <button
                        onClick={handleRemove}
                        disabled={removing}
                        className={`w-full h-9 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            removing ? "opacity-60 cursor-wait" : ""
                        }`}
                    >
                        {removing ? (
                            <span>Removing...</span>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove ♥</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;
