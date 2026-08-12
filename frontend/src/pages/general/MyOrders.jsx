import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            setError('');

            // 1. Extract Token from localStorage (tries multiple common storage keys)
            let token = localStorage.getItem('token') || 
                        localStorage.getItem('userToken') || 
                        localStorage.getItem('partnerToken');

            // Fallback: If user object was stored as JSON string
            if (!token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        token = parsed.token || parsed.userToken;
                    } catch (e) {
                        console.warn("Could not parse user object from localStorage", e);
                    }
                }
            }

            // 2. Build headers with Bearer token
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // 3. Make API request
            const API_BASE_URL = import.meta.env.VITE_API_URL || '';
            console.log("Fetching orders from:", `${API_BASE_URL}/api/orders/my-orders`);

            const res = await axios.get(
                `${API_BASE_URL}/api/orders/my-orders`,
                { 
                    headers,
                    withCredentials: true 
                }
            );

            console.log("My Orders API response data:", res.data);

            // 4. Safely extract orders array regardless of API payload structure
            let fetchedOrders = [];
            if (Array.isArray(res.data)) {
                fetchedOrders = res.data;
            } else if (Array.isArray(res.data?.orders)) {
                fetchedOrders = res.data.orders;
            } else if (Array.isArray(res.data?.data)) {
                fetchedOrders = res.data.data;
            } else if (res.data?.order && typeof res.data.order === 'object') {
                fetchedOrders = [res.data.order];
            }

            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Failed to fetch user orders:", err);
            const errorMessage = err.response?.data?.message || 
                                 err.message || 
                                 "Failed to load orders. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    // 🔴 LOADING STATE
    if (loading) {
        return (
            <div style={{ 
                minHeight: '70vh', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                color: '#a1a1aa',
                fontFamily: 'system-ui, sans-serif' 
            }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                    📦 Loading your orders...
                </div>
            </div>
        );
    }

    // 🔴 ERROR STATE
    if (error) {
        return (
            <div style={{ 
                minHeight: '70vh', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '20px', 
                color: '#fff',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{ 
                    background: '#18181b', 
                    border: '1px solid #ef4444', 
                    borderRadius: '16px', 
                    padding: '30px', 
                    maxWidth: '400px', 
                    textAlign: 'center' 
                }}>
                    <h3 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '18px' }}>
                        Unable to load orders
                    </h3>
                    <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '20px' }}>
                        {error}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button 
                            onClick={fetchUserOrders} 
                            style={{ 
                                padding: '10px 18px', 
                                background: '#22c55e', 
                                color: '#000', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontWeight: '700', 
                                cursor: 'pointer' 
                            }}
                        >
                            Retry
                        </button>
                        <button 
                            onClick={() => navigate('/user/login')} 
                            style={{ 
                                padding: '10px 18px', 
                                background: '#27272a', 
                                color: '#fff', 
                                border: '1px solid #3f3f46', 
                                borderRadius: '8px', 
                                fontWeight: '600', 
                                cursor: 'pointer' 
                            }}
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 🟢 MAIN CONTENT RENDER
    return (
        <div style={{ 
            minHeight: '80vh', 
            padding: '24px 16px 80px 16px', 
            color: '#fff', 
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '800px', 
            margin: '0 auto' 
        }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', color: '#fff' }}>
                📋 My Orders
            </h1>

            {/* 🟡 EMPTY ORDERS STATE */}
            {(!orders || orders.length === 0) ? (
                <div style={{ 
                    background: '#18181b', 
                    border: '1px solid #27272a', 
                    borderRadius: '16px', 
                    padding: '40px 20px', 
                    textAlign: 'center', 
                    color: '#a1a1aa' 
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
                    <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 8px 0' }}>No orders placed yet</h3>
                    <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>Explore delicious food items and place your first order!</p>
                    <Link 
                        to="/" 
                        style={{ 
                            display: 'inline-block',
                            padding: '10px 20px', 
                            background: '#e11d48', 
                            color: '#fff', 
                            textDecoration: 'none', 
                            borderRadius: '8px', 
                            fontWeight: '700',
                            fontSize: '14px'
                        }}
                    >
                        Explore Food
                    </Link>
                </div>
            ) : (
                /* 🟢 ORDERS LIST */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order, index) => {
                        // SAFE CHAINING TO PREVENT RUNTIME CRASHES
                        const orderId = order?._id ? String(order._id).slice(-6) : `ORD-${index + 1}`;
                        const foodTitle = order?.food?.name || order?.food?.title || order?.foodTitle || 'Food Item';
                        const status = order?.status || 'Pending';
                        const price = order?.price || order?.totalPrice || 0;
                        const quantity = order?.quantity || 1;
                        const portion = order?.portion || 'Standard';
                        const address = order?.deliveryAddress || order?.address || 'N/A';
                        const createdAt = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';

                        // Color badge according to order status
                        let statusBg = 'rgba(234, 179, 8, 0.2)';
                        let statusColor = '#eab308';
                        if (status.toLowerCase() === 'accepted' || status.toLowerCase() === 'completed') {
                            statusBg = 'rgba(34, 197, 94, 0.2)';
                            statusColor = '#22c55e';
                        } else if (status.toLowerCase() === 'rejected' || status.toLowerCase() === 'cancelled') {
                            statusBg = 'rgba(239, 68, 68, 0.2)';
                            statusColor = '#ef4444';
                        }

                        return (
                            <div 
                                key={order?._id || index} 
                                style={{ 
                                    background: '#18181b', 
                                    border: '1px solid #27272a', 
                                    borderRadius: '16px', 
                                    padding: '20px', 
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)' 
                                }}
                            >
                                {/* Header */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    borderBottom: '1px solid #27272a', 
                                    paddingBottom: '12px', 
                                    marginBottom: '12px' 
                                }}>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Order ID: #{orderId}</span>
                                        {createdAt && <span style={{ fontSize: '12px', color: '#71717a', marginLeft: '10px' }}>• {createdAt}</span>}
                                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0', color: '#fff', textTransform: 'capitalize' }}>
                                            {foodTitle}
                                        </h3>
                                    </div>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '999px', 
                                        fontSize: '12px', 
                                        fontWeight: '700', 
                                        background: statusBg, 
                                        color: statusColor,
                                        textTransform: 'capitalize'
                                    }}>
                                        {status}
                                    </span>
                                </div>

                                {/* Details Grid */}
                                <div style={{ 
                                    fontSize: '13px', 
                                    color: '#d4d4d8', 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '8px' 
                                }}>
                                    <div><strong>Portion:</strong> {portion}</div>
                                    <div><strong>Quantity:</strong> {quantity}</div>
                                    <div><strong>Total Price:</strong> ₹{price}</div>
                                    <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                                        <strong>Delivery Address:</strong> {address}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;