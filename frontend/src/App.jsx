import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "./config";

import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Products from "./Pages/Products";
import ProductDetails from "./Pages/ProductDetails";
import Wishlist from "./Pages/Wishlist";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import OrderDetails from "./Pages/OrderDetails";

function App() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/customers/me`,
        {
          credentials: "include"
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data.customer || data);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error(error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center bg-slate-50">
        <span className="font-bold text-slate-800 text-lg tracking-tight mb-1">ShopKart</span>
        <p className="text-xs text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={userData ? <Navigate to="/home" /> : <Navigate to="/products" />} />
      <Route path="/register" element={userData ? <Navigate to="/home" /> : <Register />} />
      <Route path="/login" element={userData ? <Navigate to="/home" /> : <Login setUserData={setUserData} />} />
      <Route path="/home" element={userData ? <Home setUserData={setUserData} /> : <Navigate to="/login" />} />
      <Route path="/products" element={<Products userData={userData} setUserData={setUserData} />} />
      <Route path="/products/:id" element={<ProductDetails userData={userData} setUserData={setUserData} />} />
      <Route path="/wishlist" element={userData ? <Wishlist userData={userData} setUserData={setUserData} /> : <Navigate to="/login" />} />
      <Route path="/cart" element={userData ? (<Cart userData={userData} setUserData={setUserData} />) : (<Navigate to="/login" />)} />
      <Route path="/checkout" element={userData ? <Checkout userData={userData} setUserData={setUserData} /> : <Navigate to="/login" />} />
      <Route path="/orders" element={userData ? <Orders userData={userData} setUserData={setUserData} /> : <Navigate to="/login" />} />
      <Route path="/orders/:id" element={userData ? <OrderDetails userData={userData} setUserData={setUserData} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/products" />} />
    </Routes>
  );
}

export default App;