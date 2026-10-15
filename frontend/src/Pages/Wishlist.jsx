import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;

const Wishlist = ({ userData, setUserData }) => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWishlistData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${BASE_URL}/wishlist`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            if (res.status === 401) {
                if (setUserData) setUserData(null);
                navigate("/login");
                return;
            }

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const err = new Error(data.message || "We couldn't load your wishlist.");
                err.status = res.status;
                throw err;
            }

            setWishlist(data.wishlist || []);
        } catch (err) {
            console.error("Wishlist load error:", err);
            if (err.status === 401) {
                if (setUserData) setUserData(null);
                navigate("/login");
                return;
            }
            setError(err.message || "We couldn't load your wishlist.");
        } finally {
            setLoading(false);
        }
    }, [navigate, setUserData]);

    useEffect(() => {
        fetchWishlistData();
    }, [fetchWishlistData]);

    const handleRemoveItem = async (productId) => {
        try {
            const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401) {
                if (setUserData) setUserData(null);
                navigate("/login");
                return;
            }

            if (!res.ok) {
                throw new Error(data.message || "Unable to remove product from wishlist");
            }

            setWishlist((prevList) => prevList.filter((item) => item._id !== productId));
        } catch (err) {
            console.error("Remove from wishlist error:", err);
            throw err;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar
                userData={userData}
                setUserData={setUserData}
                wishlistCount={wishlist.length}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
                <div className="mb-8 pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span>My Wishlist</span>
                            <span className="text-red-500">❤️</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Products you've saved to buy later
                        </p>
                    </div>

                    {!loading && !error && (
                        <div className="text-xs font-medium text-slate-500">
                            <span className="font-semibold text-slate-900">{wishlist.length}</span>{" "}
                            {wishlist.length === 1 ? "product saved" : "products saved"}
                        </div>
                    )}
                </div>

                {loading && (
                    <div>
                        <div className="flex items-center justify-center gap-2 mb-6 text-slate-500 text-sm font-medium">
                            <svg className="w-5 h-5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Loading your wishlist...</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4 shadow-xs">
                                    <div className="aspect-square bg-slate-200 rounded-xl" />
                                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                                    <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                                    <div className="h-9 bg-slate-200 rounded-lg w-full mt-2" />
                                    <div className="h-9 bg-slate-200 rounded-lg w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-white border border-red-200 rounded-2xl p-10 text-center max-w-md mx-auto my-12 shadow-xs">
                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Something went wrong.</h2>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                            {error || "We couldn't load your wishlist."}
                        </p>
                        <button
                            onClick={fetchWishlistData}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && wishlist.length === 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                        <div className="text-4xl mb-3">❤️</div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                            Your wishlist is empty
                        </h2>
                        <p className="text-xs text-slate-500 mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
                            Save products you love and find them here later.
                        </p>
                        <button
                            onClick={() => navigate("/products")}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mx-auto"
                        >
                            <span>Browse Products</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                )}

                {!loading && !error && wishlist.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Wishlist;
