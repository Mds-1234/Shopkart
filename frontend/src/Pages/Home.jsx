import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const BASE_URL = "http://localhost:8085";

function Home({ setUserData }) {
    const [customer, setCustomer] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch(`${BASE_URL}/customers/me`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch customer profile");
                }

                const data = await res.json();
                setCustomer(data.customer || data);

                try {
                    const wishlistRes = await fetch(`${BASE_URL}/wishlist`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: "include",
                    });

                    if (wishlistRes.ok) {
                        const wishlistData = await wishlistRes.json().catch(() => ({}));
                        if (wishlistData && typeof wishlistData.count === "number") {
                            setWishlistCount(wishlistData.count);
                        }
                    }
                } catch (wishErr) {
                    console.error("Failed to load wishlist in home:", wishErr);
                }
            } catch (error) {
                console.error("Error fetching customer:", error);
                if (setUserData) setUserData(null);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, setUserData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
                <span className="font-bold text-slate-800 text-lg tracking-tight">ShopKart</span>
                <p className="text-xs text-slate-400 mt-1">Loading...</p>
            </div>
        );
    }

    if (!customer) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar
                userData={customer}
                setUserData={setUserData}
                wishlistCount={wishlistCount}
            />

            <main className="max-w-xl mx-auto px-4 py-10 space-y-6 w-full flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
                        <div>
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold">Discover Products</h2>
                            <p className="text-indigo-100 text-xs mt-1">
                                Explore the catalog and find quality items.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/products")}
                            className="mt-4 px-3.5 py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>Browse Catalog</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
                        <div>
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <h2 className="text-base font-bold">My Wishlist</h2>
                                <span className="px-2 py-0.5 rounded-full bg-white/25 text-xs font-bold">
                                    {wishlistCount} saved
                                </span>
                            </div>
                            <p className="text-rose-100 text-xs mt-1">
                                View and manage all your saved products.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/wishlist")}
                            className="mt-4 px-3.5 py-2 bg-white text-rose-600 hover:bg-rose-50 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <span>Open Wishlist</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between sm:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h2 className="text-base font-bold">My Orders</h2>
                                <p className="text-emerald-100 text-xs mt-1">
                                    Track shipments, review past purchases, and view order receipts.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/orders")}
                                className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
                            >
                                <span>Order History</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 mb-6">
                        Customer Details
                    </h2>

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Full Name
                            </span>
                            <span className="text-sm font-medium text-slate-900 mt-1 sm:mt-0">
                                {customer.fullName}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Email Address
                            </span>
                            <span className="text-sm font-medium text-slate-900 mt-1 sm:mt-0">
                                {customer.email}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Phone Number
                            </span>
                            <span className="text-sm font-medium text-slate-900 mt-1 sm:mt-0">
                                {customer.phone}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;