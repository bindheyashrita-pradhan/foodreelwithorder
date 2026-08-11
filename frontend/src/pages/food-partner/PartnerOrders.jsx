import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PartnerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPartnerOrders = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('partnerToken');
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/orders/partner-orders`,
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true 
                }
            );
            if (res.data?.success) {
                setOrders(res.data.orders);
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
            const token = localStorage.getItem('token') || localStorage.getItem('partnerToken');
            const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
                { status: newStatus },
                { 
                    headers: { Authorization: `Bearer ${token}` },
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
        return <div style={{ color: '#fff', textAlign: 'center', padding: 40 }}>Loading incoming orders...</div>;
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, color: '#fff', fontFamily: 'system-ui' }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Incoming Customer Orders</h1>

            {orders.length === 0 ? (
                <div style={{ background: '#18181b', padding: 30, borderRadius: 12, textAlign: 'center', color: '#a1a1aa' }}>
                    No orders received yet.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map(order => (
                        <div key={order._id} style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: 18 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>Order ID: #{order._id.slice(-6)}</span>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0 0 0' }}>
                                        {order.food?.name || order.food?.title || 'Dish Item'}
                                    </h3>
                                </div>
                                <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: 999, 
                                    fontSize: 12, 
                                    fontWeight: 700,
                                    background: order.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : order.status === 'Accepted' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: order.status === 'Pending' ? '#eab308' : order.status === 'Accepted' ? '#22c55e' : '#ef4444'
                                }}>
                                    {order.status}
                                </span>
                            </div>

                            <div style={{ fontSize: 13, color: '#d4d4d8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0' }}>
                                <div><strong>Portion:</strong> {order.portion}</div>
                                <div><strong>Quantity:</strong> {order.quantity}</div>
                                <div><strong>Price:</strong> ₹{order.price}</div>
                                <div><strong>Phone:</strong> {order.phone || 'N/A'}</div>
                                <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {order.deliveryAddress}</div>
                            </div>

                            {order.status === 'Pending' && (
                                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
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
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerOrders;