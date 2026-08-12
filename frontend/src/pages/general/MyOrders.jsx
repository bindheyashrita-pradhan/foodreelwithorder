import React, { useState } from 'react';
import axios from 'axios';

const OrderModal = ({ foodItem, onClose }) => {
    // 🛑 GUARD 1: Prevent ghost modal from rendering on /my-orders or empty selection
    if (!foodItem || (!foodItem._id && !foodItem.name && !foodItem.title)) {
        return null;
    }

    const itemName = foodItem.name || foodItem.title || foodItem.foodName || 'Food Item';

    // Helper: Safely normalize portion sizes from any MongoDB format
    const getNormalizedPortions = (item) => {
        if (!item || !item.portions) {
            return [{ name: 'Standard / Full', price: Number(item?.price || 150) }];
        }

        let rawPortions = item.portions;

        // Convert Mongoose Map to object if needed
        if (typeof rawPortions?.toObject === 'function') {
            rawPortions = rawPortions.toObject();
        }

        // 1. Array format: [{ name: 'Small', price: 200 }, ...]
        if (Array.isArray(rawPortions) && rawPortions.length > 0) {
            return rawPortions.map(p => {
                if (typeof p === 'object' && p !== null) {
                    return {
                        name: String(p.name || p.portion || p.label || 'Portion'),
                        price: Number(p.price || p.cost || 0)
                    };
                }
                return { name: `Portion (${p})`, price: Number(p) };
            });
        }

        // 2. Object format: { small: 200, medium: 250, large: 300 }
        if (typeof rawPortions === 'object' && rawPortions !== null) {
            const entries = Object.entries(rawPortions);
            if (entries.length > 0) {
                const result = entries
                    .filter(([_, val]) => val !== undefined && val !== null && !isNaN(Number(val)) && Number(val) > 0)
                    .map(([key, val]) => ({
                        name: String(key).charAt(0).toUpperCase() + String(key).slice(1),
                        price: Number(val)
                    }));
                if (result.length > 0) return result;
            }
        }

        const basePrice = Number(item.price || item.basePrice || 150);
        return [{ name: 'Standard / Full', price: basePrice }];
    };

    const availablePortions = getNormalizedPortions(foodItem);
    const [selectedPortion, setSelectedPortion] = useState(availablePortions[0]);
    const [quantity, setQuantity] = useState(1);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const unitPrice = Number(selectedPortion?.price || foodItem?.price || 150);
    const totalPrice = unitPrice * quantity;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!phone.trim() || !address.trim()) {
            return alert('Please fill in both your phone number and delivery address.');
        }

        const partnerId = typeof foodItem?.foodPartner === 'object' && foodItem?.foodPartner !== null
            ? foodItem.foodPartner._id 
            : (foodItem?.foodPartner || foodItem?.partnerId || foodItem?.foodPartnerId);

        if (!partnerId) {
            return alert('Unable to detect restaurant partner for this item.');
        }

        const token = localStorage.getItem('token') || 
                      localStorage.getItem('userToken') || 
                      localStorage.getItem('partnerToken');

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const res = await axios.post(
                `${baseUrl}/api/orders/create`,
                {
                    foodId: foodItem._id,
                    foodPartnerId: partnerId,
                    portion: selectedPortion?.name || 'Standard',
                    price: totalPrice,
                    quantity: quantity,
                    phone: phone,
                    deliveryAddress: address
                },
                { 
                    headers,
                    withCredentials: true 
                }
            );

            if (res.data?.success) {
                alert('🎉 Order placed successfully!');
                onClose();
            }
        } catch (err) {
            console.error("Order submit error:", err);
            alert(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999999,
            padding: 16
        }}>
            <div style={{
                background: '#18181b',
                color: '#ffffff',
                width: '100%',
                maxWidth: 460,
                borderRadius: 16,
                padding: 24,
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                position: 'relative',
                border: '1px solid #27272a',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    borderBottom: '1px solid #27272a',
                    paddingBottom: 12
                }}>
                    <div>
                        <span style={{ fontSize: 11, color: '#eab308', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block' }}>
                            Ordering From
                        </span>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
                            {foodItem?.foodPartner?.restaurantName || foodItem?.foodPartner?.name || 'Food Partner'}
                        </h2>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            color: '#a1a1aa',
                            fontSize: 24,
                            fontWeight: 700,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Selected Dish Card */}
                    <div style={{
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: 12,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.05em' }}>
                                Selected Dish
                            </span>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', textTransform: 'capitalize', margin: '2px 0 0 0' }}>
                                {itemName}
                            </h3>
                        </div>
                        <div style={{
                            background: 'rgba(234, 179, 8, 0.2)',
                            color: '#eab308',
                            border: '1px solid rgba(234, 179, 8, 0.4)',
                            padding: '4px 12px',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 700
                        }}>
                            ₹{unitPrice}
                        </div>
                    </div>

                    {/* Portion & Quantity Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                                Portion Size
                            </label>
                            <select 
                                value={selectedPortion?.name}
                                onChange={(e) => {
                                    const selected = availablePortions.find(p => p.name === e.target.value);
                                    if (selected) setSelectedPortion(selected);
                                }}
                                style={{
                                    width: '100%',
                                    background: '#09090b',
                                    color: '#ffffff',
                                    border: '1px solid #3f3f46',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {availablePortions.map((p, idx) => (
                                    <option key={idx} value={p.name} style={{ background: '#18181b', color: '#fff' }}>
                                        {p.name} (₹{p.price})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                                Quantity
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: '100%',
                                    background: '#09090b',
                                    color: '#ffffff',
                                    border: '1px solid #3f3f46',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Phone Number Input */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                            Phone Number *
                        </label>
                        <input 
                            type="tel"
                            required
                            placeholder="Enter contact number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#09090b',
                                color: '#ffffff',
                                border: '1px solid #3f3f46',
                                borderRadius: 8,
                                padding: '10px 12px',
                                fontSize: 13,
                                fontWeight: 500,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Delivery Address Input */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                            Delivery Address *
                        </label>
                        <textarea 
                            required
                            rows="2"
                            placeholder="House no, street, landmark..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            style={{
                                width: '100%',
                                background: '#09090b',
                                color: '#ffffff',
                                border: '1px solid #3f3f46',
                                borderRadius: 8,
                                padding: '10px 12px',
                                fontSize: 13,
                                fontWeight: 500,
                                outline: 'none',
                                boxSizing: 'border-box',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Payment Method Option */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                            Payment Method
                        </label>
                        <div style={{
                            width: '100%',
                            background: '#09090b',
                            border: '1px solid #27272a',
                            borderRadius: 8,
                            padding: '10px 12px',
                            fontSize: 13,
                            color: '#d4d4d8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxSizing: 'border-box'
                        }}>
                            <span>Cash on Delivery</span>
                            <span style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                                Active
                            </span>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: 8,
                            padding: '12px 16px',
                            backgroundColor: '#eab308',
                            color: '#000000',
                            fontWeight: 700,
                            fontSize: 15,
                            borderRadius: 12,
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'background-color 0.2s ease'
                        }}
                    >
                        {loading ? 'Placing Order...' : `Place Order • ₹${totalPrice}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;