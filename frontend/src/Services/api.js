const BASE_URL = "http://localhost:8085";

export const createPaymentOrder = async (shippingAddress) => {
    const response = await fetch(`${BASE_URL}/orders/create-payment-order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ shippingAddress })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to create payment order");
    }

    return data;
};

export const verifyPayment = async ({
    shopKartOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
}) => {
    const response = await fetch(`${BASE_URL}/orders/verify-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
    }

    return data;
};

export const getOrders = async () => {
    const response = await fetch(`${BASE_URL}/orders`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "Failed to fetch orders");
        error.status = response.status;
        throw error;
    }

    return data;
};

export const fetchOrders = getOrders;

export const getOrderById = async (id) => {
    const response = await fetch(`${BASE_URL}/orders/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "Failed to fetch order");
        error.status = response.status;
        throw error;
    }

    return data;
};

export const fetchOrderById = getOrderById;

export const updateOrderStatus = async (id, status) => {
    const response = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ status })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "Failed to update order status");
        error.status = response.status;
        throw error;
    }

    return data;
};

export default {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    fetchOrders,
    getOrderById,
    fetchOrderById,
    updateOrderStatus
};
