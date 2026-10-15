import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Login({ setUserData }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length <= 6) {
            newErrors.password = "Password should be greater than 6 characters";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            setLoading(true);
            setServerError("");

            const response = await fetch(
                `${API_BASE_URL}/customers/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.status === 404) {
                setServerError("Email does not exist");
                return;
            }

            if (response.status === 401) {
                setServerError("Incorrect password");
                return;
            }

            if (!response.ok) {
                setServerError(data.message || "Login failed");
                return;
            }

            setEmail("");
            setPassword("");

            if (setUserData) {
                setUserData(data.customer || data);
            }

            navigate("/home");
        } catch (error) {
            console.error("Login error:", error);
            setServerError("Unable to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">

            <div className="mb-8 text-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900">ShopKart</span>
            </div>

            <div className="w-full max-w-[400px] bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

                <div className="mb-6 text-center">
                    <h1 className="text-xl font-bold text-slate-900">
                        Sign in to your account
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Enter your credentials to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors({ ...errors, email: "" });
                                setServerError("");
                            }}
                            className={`w-full h-10 px-3.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none ${
                                errors.email
                                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    : "border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            }`}
                            placeholder="name@example.com"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors({ ...errors, password: "" });
                                setServerError("");
                            }}
                            className={`w-full h-10 px-3.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none ${
                                errors.password
                                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    : "border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            }`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {serverError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-start gap-2">
                            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{serverError}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                </form>

                <p className="text-xs text-slate-500 mt-6 text-center">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                        Create account
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;