import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PartnerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPartnerOrders = async () => {
        try {
            const token = localStorage.getItem('token') || 
                          localStorage.getItem('partnerToken') || 
                          localStorage.getItem('userToken');

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/orders/partner-orders`,
                { 
                    headers,
                    withCredentials: true 
                }
            );

            console.log("Partner orders response:", res.data);

            if (res.data?.success) {
                setOrders(res.data.orders || []);
            }
        } catch (err) {
            console.error("Failed to fetch partner orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnerOrders();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token') || 
                          localStorage.getItem('partnerToken') || 
                          localStorage.getItem('userToken');

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                { 
                    headers,
                    withCredentials: true 
                }
            );

            if (res.data?.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) {
        return <div style={{ color: '#000', textAlign: 'center', padding: 60, fontFamily: 'system-ui', fontWeight: 600 }}>Loading incoming orders...</div>;
    }

    return (
        <div style={{ minHeight: '80vh', padding: '30px 16px', backgroundColor: '#09090b', color: '#fff', fontFamily: 'system-ui' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#ffffff' }}>
                    📦 Incoming Customer Orders
                </h1>

                {orders.length === 0 ? (
                    <div style={{ background: '#18181b', padding: 40, borderRadius: 16, textAlign: 'center', color: '#a1a1aa', border: '1px solid #27272a' }}>
                        <p style={{ fontSize: 16, margin: 0 }}>No orders received for your restaurant yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {orders.map(order => (
                            <div key={order._id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #27272a', paddingBottom: 12 }}>
                                    <div>
                                        <span style={{ fontSize: 12, color: '#a1a1aa' }}>Order ID: #{order._id?.slice(-6)}</span>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 0 0', textTransform: 'capitalize', color: '#fff' }}>
                                            {order.food?.name || order.food?.title || 'Dish Item'}
                                        </h3>
                                    </div>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: 999, 
                                        fontSize: 12, 
                                        fontWeight: 700,
                                        background: order.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : order.status === 'Accepted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: order.status === 'Pending' ? '#eab308' : order.status === 'Accepted' ? '#22c55e' : '#ef4444'
                                    }}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>

                                <div style={{ fontSize: 13, color: '#d4d4d8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0' }}>
                                    <div><strong>Portion:</strong> {order.portion}</div>
                                    <div><strong>Quantity:</strong> {order.quantity}</div>
                                    <div><strong>Total Price:</strong> ₹{order.price}</div>
                                    <div><strong>Customer Phone:</strong> {order.phone || 'N/A'}</div>
                                    <div style={{ gridColumn: 'span 2', marginTop: 4 }}><strong>Delivery Address:</strong> {order.deliveryAddress}</div>
                                </div>

                                {order.status === 'Pending' && (
                                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                        <button 
                                            onClick={() => updateOrderStatus(order._id, 'Accepted')}
                                            style={{ flex: 1, padding: '10px', background: '#22c55e', color: '#000', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                                        >
                                            Accept Order
                                        </button>
                                        <button 
                                            onClick={() => updateOrderStatus(order._id, 'Rejected')}
                                            style={{ flex: 1, padding: '10px', background: '#3f3f46', color: '#ef4444', fontWeight: 700, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                                        >
                                            Reject Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerOrders;