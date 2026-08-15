import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderModal = ({ foodItem, onClose }) => {
    const itemName = foodItem?.name || foodItem?.title || foodItem?.foodName || 'Selected Food Item';

    // 🟢 DYNAMICALLY PARSE portions ({ small, medium, large }) FROM FOOD MODEL
    const getAvailablePortions = (food) => {
        if (!food) return [{ name: 'Standard / Full', price: 150 }];

        const portions = [];

        if (food.portions && typeof food.portions === 'object' && !Array.isArray(food.portions)) {
            const { small, medium, large } = food.portions;

            if (small && Number(small) > 0) {
                portions.push({ name: 'Small', price: Number(small) });
            }
            if (medium && Number(medium) > 0) {
                portions.push({ name: 'Medium', price: Number(medium) });
            }
            if (large && Number(large) > 0) {
                portions.push({ name: 'Large', price: Number(large) });
            }
        }

        if (portions.length === 0 && Array.isArray(food.portions) && food.portions.length > 0) {
            food.portions.forEach((p, idx) => {
                if (typeof p === 'object' && p !== null) {
                    portions.push({
                        name: p.name || p.portion || `Portion ${idx + 1}`,
                        price: Number(p.price || p.rate || food.price || 150)
                    });
                } else if (typeof p === 'number' && Number(p) > 0) {
                    const names = ['Small', 'Medium', 'Large'];
                    portions.push({ name: names[idx] || `Option ${idx + 1}`, price: Number(p) });
                }
            });
        }

        if (portions.length === 0) {
            const basePrice = Number(food.price || food.basePrice || 150);
            portions.push({ name: 'Standard / Full', price: basePrice });
        }

        return portions;
    };

    const availablePortions = getAvailablePortions(foodItem);

    const [selectedPortion, setSelectedPortion] = useState(availablePortions[0]);
    const [quantity, setQuantity] = useState(1);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const portions = getAvailablePortions(foodItem);
        if (portions.length > 0) {
            setSelectedPortion(portions[0]);
        }
    }, [foodItem]);

    const unitPrice = Number(selectedPortion?.price || foodItem?.price || 150);
    const validQty = Math.max(1, Number(quantity) || 1);
    const totalPrice = unitPrice * validQty;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!phone.trim() || !address.trim()) {
            return alert('Please fill in both your phone number and delivery address.');
        }

        const partnerId = typeof foodItem?.foodPartner === 'object' && foodItem?.foodPartner !== null
            ? foodItem.foodPartner._id 
            : (foodItem?.foodPartner || foodItem?.partnerId);

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
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/orders/create`,
                {
                    foodId: foodItem._id,
                    foodPartnerId: partnerId,
                    portion: selectedPortion?.name || 'Standard',
                    price: totalPrice,
                    quantity: validQty,
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
            const errorMsg = err.response?.data?.message || 'Failed to place order. Please verify you are logged in.';
            alert(errorMsg);
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
                                    boxSizing: 'border-box',
                                    height: '38px'
                                }}
                            >
                                {availablePortions.map((p, idx) => (
                                    <option key={idx} value={p.name} style={{ background: '#18181b', color: '#fff' }}>
                                        {p.name} (₹{p.price})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 🟢 FIXED QUANTITY INPUT WITH STEPPER BUTTONS */}
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#d4d4d8', marginBottom: 6 }}>
                                Quantity
                            </label>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: '#09090b',
                                border: '1px solid #3f3f46',
                                borderRadius: 8,
                                overflow: 'hidden',
                                height: '38px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(prev => Math.max(1, (Number(prev) || 1) - 1))}
                                    style={{
                                        width: 36,
                                        height: '100%',
                                        background: '#27272a',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    min="1" 
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setQuantity(''); // 🟢 Allows backspacing to type any number
                                        } else {
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num)) setQuantity(num);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (!quantity || Number(quantity) < 1) setQuantity(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        background: 'transparent',
                                        color: '#ffffff',
                                        border: 'none',
                                        textAlign: 'center',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(prev => (Number(prev) || 1) + 1)}
                                    style={{
                                        width: 36,
                                        height: '100%',
                                        background: '#27272a',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    +
                                </button>
                            </div>
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