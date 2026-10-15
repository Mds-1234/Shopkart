import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../Context/CartContext.jsx"

const Navbar = ({ userData, setUserData, wishlistCount = 0 }) => {
    const navigate = useNavigate()
    const { totalItems } = useCart()

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:8085/customers/logout", {
                method: "POST",
                credentials: "include"
            })

            setUserData(null)
            navigate("/login")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <nav className="w-full border-b border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">

                    <Link
                        to="/products"
                        className="text-xl font-bold text-indigo-600"
                    >
                        ShopKart
                    </Link>

                    <div className="flex items-center gap-6">

                        <Link
                            to="/home"
                            className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                        >
                            Home
                        </Link>

                        <Link
                            to="/products"
                            className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                        >
                            Products
                        </Link>

                        <Link
                            to="/wishlist"
                            className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                        >
                            Wishlist
                            {wishlistCount > 0 && (
                                <span className="ml-1 text-indigo-600">
                                    ({wishlistCount})
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/cart"
                            className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                        >
                            Cart
                            <span className="ml-1 text-indigo-600">
                                ({totalItems})
                            </span>
                        </Link>

                        {userData && (
                            <Link
                                to="/orders"
                                className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                            >
                                Orders
                            </Link>
                        )}

                        {userData ? (
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-red-600 hover:text-red-700 cursor-pointer"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-slate-700 hover:text-indigo-600"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar