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

            // Extract Token from localStorage
            let token = localStorage.getItem('token') || 
                        localStorage.getItem('userToken') || 
                        localStorage.getItem('partnerToken');

            if (!token) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        token = parsed.token || parsed.userToken;
                    } catch (e) {}
                }
            }

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const API_BASE_URL = import.meta.env.VITE_API_URL || '';
            const res = await axios.get(
                `${API_BASE_URL}/api/orders/my-orders`,
                { 
                    headers,
                    withCredentials: true 
                }
            );

            console.log("My Orders response:", res.data);

            let fetchedOrders = [];
            if (Array.isArray(res.data)) {
                fetchedOrders = res.data;
            } else if (Array.isArray(res.data?.orders)) {
                fetchedOrders = res.data.orders;
            } else if (Array.isArray(res.data?.data)) {
                fetchedOrders = res.data.data;
            }

            setOrders(fetchedOrders);
        } catch (err) {
            console.error("Failed to fetch user orders:", err);
            setError(err.response?.data?.message || err.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    // 🔴 FULL PAGE DARK BACKGROUND WRAPPER
    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#09090b', // Fixes white background issue
            color: '#ffffff', 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '30px 16px 100px 16px'
        }}>
            <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                
                {/* 🟢 FIXED TITLE VISIBILITY */}
                <h1 style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    marginBottom: '24px', 
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    📋 My Orders
                </h1>

                {/* LOADING STATE */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#a1a1aa' }}>
                        <p style={{ fontSize: '16px' }}>Loading your order history...</p>
                    </div>
                )}

                {/* ERROR STATE */}
                {!loading && error && (
                    <div style={{ 
                        background: '#18181b', 
                        border: '1px solid #ef4444', 
                        borderRadius: '12px', 
                        padding: '24px', 
                        textAlign: 'center' 
                    }}>
                        <p style={{ color: '#ef4444', margin: '0 0 16px 0' }}>⚠️ {error}</p>
                        <button 
                            onClick={fetchUserOrders}
                            style={{ padding: '8px 16px', background: '#27272a', color: '#fff', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && orders.length === 0 && (
                    <div style={{ 
                        background: '#18181b', 
                        border: '1px solid #27272a', 
                        borderRadius: '16px', 
                        padding: '40px 20px', 
                        textAlign: 'center', 
                        color: '#a1a1aa' 
                    }}>
                        <p style={{ fontSize: '16px', margin: '0 0 16px 0' }}>You haven't placed any orders yet.</p>
                        <Link 
                            to="/" 
                            style={{ padding: '10px 20px', background: '#22c55e', color: '#000', textDecoration: 'none', borderRadius: '8px', fontWeight: '700' }}
                        >
                            Explore Dishes
                        </Link>
                    </div>
                )}

                {/* 🟢 ORDERS LIST */}
                {!loading && !error && orders.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.map((order, index) => {
                            const orderId = order?._id ? String(order._id).slice(-6) : `ORD-${index + 1}`;
                            
                            // 🟢 EXTENSIVE FOOD TITLE EXTRACTION (Checks all backend variations)
                            const foodTitle = order?.food?.name || 
                                               order?.food?.title || 
                                               order?.foodId?.name || 
                                               order?.foodId?.title || 
                                               order?.foodItem?.name || 
                                               order?.foodItem?.title || 
                                               order?.foodName || 
                                               order?.title || 
                                               'Dish Item';

                            const status = order?.status || 'Pending';
                            const price = order?.price || order?.totalPrice || 0;
                            const quantity = order?.quantity || 1;
                            const portion = order?.portion || 'Standard / Full';
                            const address = order?.deliveryAddress || order?.address || 'N/A';
                            const date = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : '';

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
                                            {date && <span style={{ fontSize: '12px', color: '#71717a', marginLeft: '8px' }}>• {date}</span>}
                                            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '4px 0 0 0', textTransform: 'capitalize', color: '#ffffff' }}>
                                                {foodTitle}
                                            </h3>
                                        </div>

                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '999px', 
                                            fontSize: '12px', 
                                            fontWeight: '700', 
                                            background: status === 'Accepted' ? 'rgba(34, 197, 94, 0.2)' : status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                            color: status === 'Accepted' ? '#22c55e' : status === 'Rejected' ? '#ef4444' : '#eab308'
                                        }}>
                                            {status}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '13px', color: '#d4d4d8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
        </div>
    );
};

export default MyOrders;