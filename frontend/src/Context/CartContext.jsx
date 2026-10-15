import { createContext, useContext, useEffect, useState } from "react"
import { API_BASE_URL } from "../config"

const CartContext = createContext()

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([])
    const [cartLoading, setCartLoading] = useState(false)
    const [cartError, setCartError] = useState("")

    const refreshCart = async () => {
        try {
            setCartLoading(true)
            setCartError("")

            const response = await fetch(`${API_BASE_URL}/cart`, {
                method: "GET",
                credentials: "include"
            })

            const data = await response.json()

            if (response.status === 401) {
                setCartItems([])
                setCartError("")
                return
            }

            if (!response.ok) {
                throw new Error(data.message || "Failed to load cart")
            }

            setCartItems(data.cart || [])
        } catch (error) {
            console.log(error)
            setCartError(error.message)
        } finally {
            setCartLoading(false)
        }
    }

    const addToCart = async (productId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/cart/${productId}`,
                {
                    method: "POST",
                    credentials: "include"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || "Failed to add product"
                }
            }

            await refreshCart()

            return {
                success: true
            }

        } catch (error) {
            console.log(error)

            return {
                success: false,
                message: "Unable to add product to cart"
            }
        }
    }

    const updateCartQuantity = async (productId, quantity) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/cart/${productId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        quantity: quantity
                    })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || "Failed to update quantity"
                }
            }

            await refreshCart()

            return {
                success: true
            }

        } catch (error) {
            console.log(error)

            return {
                success: false,
                message: "Unable to update cart"
            }
        }
    }

    const removeFromCart = async (productId) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/cart/${productId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            )

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || "Failed to remove product"
                }
            }

            await refreshCart()

            return {
                success: true
            }

        } catch (error) {
            console.log(error)

            return {
                success: false,
                message: "Unable to remove product"
            }
        }
    }

    useEffect(() => {
        refreshCart()
    }, [])

    const totalItems = cartItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
    )

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + ((item.product?.price || 0) * (item.quantity || 0)),
        0
    )

    const clearCart = () => {
        setCartItems([])
    }

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartLoading,
                cartError,
                totalItems,
                subtotal,
                addToCart,
                updateCartQuantity,
                removeFromCart,
                refreshCart,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    return useContext(CartContext)
}