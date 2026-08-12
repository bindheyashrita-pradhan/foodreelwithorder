import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyOrders = async () => {
        try {
            // Retrieve token from localStorage or nested user object
            const savedUserStr = localStorage.getItem('user');
            let parsedUserToken = null;
            if (savedUserStr) {
                try {
                    const parsed = JSON.parse(savedUserStr);
                    parsedUserToken = parsed.token || parsed.userToken;
                } catch (err) { /* ignore */ }
            }

            const token = localStorage.getItem('token') || 
                          localStorage.getItem('userToken') || 
                          localStorage.getItem('authToken') || 
                          parsedUserToken;

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
                {
                    headers,
                    withCredentials: true
                }
            );

            if (res.data?.success) {
                setOrders(res.data.orders || []);
            }
        } catch (err) {
            console.error("Failed to fetch my orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('userToken');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`,
                { headers, withCredentials: true }
            );

            if (res.data?.success) {
                alert('Order deleted successfully');
                setOrders(prev => prev.filter(order => order._id !== orderId));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete order');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Accepted':
                return { bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' };
            case 'Rejected':
            case 'Cancelled':
                return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
            case 'Completed':
                return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' };
            default:
                return { bg: 'rgba(234, 179, 8, 0.2)', color: '#eab308' };
        }
    };

    if (loading) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', padding: 60, fontFamily: 'system-ui' }}>
                Loading your orders...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '80vh', padding: '30px 16px', backgroundColor: '#09090b', color: '#fff', fontFamily: 'system-ui' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#ffffff' }}>
                    🛍️ My Orders
                </h1>

                {orders.length === 0 ? (
                    <div style={{ background: '#18181b', padding: 40, borderRadius: 16, textAlign: 'center', color: '#a1a1aa', border: '1px solid #27272a' }}>
                        <p style={{ fontSize: 16, margin: 0 }}>You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {orders.map((order) => {
                            const statusBadge = getStatusStyle(order.status);
                            const dishName = order.food?.name || order.food?.title || 'Food Item';
                            const restaurantName = order.foodPartner?.restaurantName || order.foodPartner?.name || 'Restaurant Partner';

                            return (
                                <div 
                                    key={order._id} 
                                    style={{ 
                                        background: '#18181b', 
                                        border: '1px solid #27272a', 
                                        borderRadius: 16, 
                                        padding: 20,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)' 
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottom: '1px solid #27272a', paddingBottom: 12 }}>
                                        <div>
                                            <span style={{ fontSize: 11, color: '#eab308', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {restaurantName}
                                            </span>
                                            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '2px 0 0 0', textTransform: 'capitalize', color: '#ffffff' }}>
                                                {dishName}
                                            </h3>
                                        </div>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: 999, 
                                            fontSize: 12, 
                                            fontWeight: 700,
                                            background: statusBadge.bg,
                                            color: statusBadge.color
                                        }}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: 13, color: '#d4d4d8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        <div><strong>Portion:</strong> {order.portion}</div>
                                        <div><strong>Quantity:</strong> {order.quantity}</div>
                                        <div><strong>Total Price:</strong> ₹{order.price}</div>
                                        <div><strong>Order ID:</strong> #{order._id?.slice(-6)}</div>
                                        <div style={{ gridColumn: 'span 2', marginTop: 4 }}>
                                            <strong>Delivery Address:</strong> {order.deliveryAddress}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleDeleteOrder(order._id)}
                                            style={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                padding: '6px 14px',
                                                borderRadius: 8,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🗑️ Cancel / Delete Order
                                        </button>
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