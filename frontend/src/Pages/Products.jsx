import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;

const Products = ({ userData, setUserData }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [wishlistIds, setWishlistIds] = useState(new Set());

    const currentSearch = searchParams.get("search") || "";
    const currentCategory = searchParams.get("category") || "";

    const [searchInput, setSearchInput] = useState(currentSearch);

    useEffect(() => {
        setSearchInput(currentSearch);
    }, [currentSearch]);

    const fetchUserWishlist = useCallback(async () => {
        if (!userData) {
            setWishlistIds(new Set());
            return;
        }

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
                    const ids = new Set(data.wishlist.map((item) => item._id || item));
                    setWishlistIds(ids);
                }
            }
        } catch (err) {
            console.error("Could not fetch user wishlist:", err);
        }
    }, [userData]);

    useEffect(() => {
        fetchUserWishlist();
    }, [fetchUserWishlist]);

    const handleWishlistToggle = async (productId, currentlySaved) => {
        if (!userData) {
            navigate("/login");
            return false;
        }

        if (currentlySaved) {
            const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || "Unable to remove product from wishlist");
            }

            setWishlistIds((prev) => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
            return true;
        } else {
            const res = await fetch(`${BASE_URL}/wishlist/${productId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await res.json().catch(() => ({}));
            if (res.status === 409) {
                setWishlistIds((prev) => {
                    const next = new Set(prev);
                    next.add(productId);
                    return next;
                });
                return true;
            }

            if (!res.ok) {
                throw new Error(data.message || "Unable to save product. Please try again.");
            }

            setWishlistIds((prev) => {
                const next = new Set(prev);
                next.add(productId);
                return next;
            });
            return true;
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${BASE_URL}/products/categories`);
            if (res.ok) {
                const data = await res.json();
                if (data.categories && data.categories.length > 0) {
                    setCategories(data.categories);
                }
            }
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    };

    const fetchProducts = useCallback(async (searchQuery, categoryQuery) => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            if (searchQuery && searchQuery.trim()) {
                params.append("search", searchQuery.trim());
            }
            if (categoryQuery && categoryQuery.trim() && categoryQuery !== "All") {
                params.append("category", categoryQuery.trim());
            }

            const queryString = params.toString();
            const url = `${BASE_URL}/products${queryString ? `?${queryString}` : ""}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }

            const data = await response.json();
            setProducts(data.products || []);

            if (data.products && data.products.length > 0) {
                setCategories((prev) => {
                    const combined = new Set([...prev, ...data.products.map((p) => p.category).filter(Boolean)]);
                    return Array.from(combined);
                });
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts(currentSearch, currentCategory);
    }, [currentSearch, currentCategory, fetchProducts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== currentSearch) {
                const newParams = {};
                if (searchInput.trim()) newParams.search = searchInput.trim();
                if (currentCategory) newParams.category = currentCategory;
                setSearchParams(newParams);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchInput, currentSearch, currentCategory, setSearchParams]);

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        const newParams = {};
        if (currentSearch) newParams.search = currentSearch;
        if (value) newParams.category = value;
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar
                userData={userData}
                setUserData={setUserData}
                wishlistCount={wishlistIds.size}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Products Catalog
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                Discover and browse quality products at the best prices
                            </p>
                        </div>

                        <div className="text-xs font-medium text-slate-500">
                            Showing <span className="font-semibold text-slate-900">{products.length}</span> items
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search products by name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                            />
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput("");
                                        const newParams = {};
                                        if (currentCategory) newParams.category = currentCategory;
                                        setSearchParams(newParams);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="w-full md:w-64">
                            <select
                                value={currentCategory}
                                onChange={handleCategoryChange}
                                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(currentSearch || currentCategory) && (
                            <button
                                onClick={clearFilters}
                                className="h-11 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4 shadow-xs">
                                <div className="aspect-square bg-slate-200 rounded-xl" />
                                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                                <div className="h-8 bg-slate-200 rounded-lg w-full mt-2" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Failed to Load Products</h3>
                        <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
                        <button
                            onClick={() => fetchProducts(currentSearch, currentCategory)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-5">
                            We couldn't find any products matching your search or category filter.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                isWishlisted={wishlistIds.has(product._id)}
                                onWishlistToggle={handleWishlistToggle}
                                userData={userData}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Products;