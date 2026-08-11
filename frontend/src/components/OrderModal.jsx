import React, { useState } from 'react';
import axios from 'axios';

const OrderModal = ({ foodItem, onClose }) => {
    // 1. Extract food title or parse from description
    const getFoodName = () => {
        if (foodItem?.name) return foodItem.name;
        if (foodItem?.title) return foodItem.title;
        if (foodItem?.foodName) return foodItem.foodName;
        if (foodItem?.description) {
            const parts = foodItem.description.split(':');
            if (parts.length > 1) return parts[0].trim();
        }
        return 'Special Dish';
    };

    const itemName = getFoodName();

    // 2. Portion choices
    const portions = foodItem?.portions && foodItem.portions.length > 0 
        ? foodItem.portions 
        : [{ name: 'Medium / Reg', price: foodItem?.price || 150 }];

    const [selectedPortion, setSelectedPortion] = useState(portions[0]);
    const [quantity, setQuantity] = useState(1);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Calculate total price
    const unitPrice = selectedPortion?.price || foodItem?.price || 0;
    const totalPrice = unitPrice * quantity;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Retrieve token from localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('userToken');
        
        if (!token) {
            return alert('Please log in as a customer first before placing an order.');
        }

        if (!phone.trim() || !address.trim()) {
            return alert('Please fill in both your phone number and delivery address.');
        }

        // Safely resolve foodPartner ID
        const partnerId = typeof foodItem?.foodPartner === 'object' && foodItem?.foodPartner !== null
            ? foodItem.foodPartner._id 
            : (foodItem?.foodPartner || foodItem?.partnerId);

        if (!partnerId) {
            return alert('Unable to detect restaurant partner for this item. Please try another reel.');
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
                    quantity: quantity,
                    phone: phone,
                    deliveryAddress: address
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}` 
                    },
                    withCredentials: true 
                }
            );

            if (res.data?.success) {
                alert('🎉 Order placed successfully!');
                onClose();
            }
        } catch (err) {
            console.error("Order submission error:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to place order';
            alert(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#18181b] text-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-zinc-800">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-5 border-b border-zinc-800 pb-3">
                    <div>
                        <span className="text-xs text-yellow-500 font-semibold tracking-wider uppercase block">Ordering From</span>
                        <h2 className="text-lg font-bold text-white">
                            {foodItem?.foodPartner?.restaurantName || foodItem?.foodPartner?.name || 'Restaurant Partner'}
                        </h2>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-2xl font-bold leading-none p-1"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                    {/* Food Item Badge */}
                    <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3.5 flex items-center justify-between">
                        <div>
                            <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-0.5">
                                Selected Dish
                            </label>
                            <h3 className="text-base font-bold text-white">
                                {itemName}
                            </h3>
                        </div>
                        <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold">
                            ₹{unitPrice}
                        </div>
                    </div>

                    {/* Portion & Quantity Selection */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1">
                                Portion Size
                            </label>
                            <select 
                                value={selectedPortion?.name}
                                onChange={(e) => {
                                    const selected = portions.find(p => p.name === e.target.value);
                                    setSelectedPortion(selected);
                                }}
                                className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-yellow-500"
                            >
                                {portions.map((p, idx) => (
                                    <option key={idx} value={p.name} className="bg-zinc-900 text-white">
                                        {p.name} (₹{p.price})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1">
                                Quantity
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-zinc-900 text-white border border-zinc-700 rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-yellow-500"
                            />
                        </div>
                    </div>

                    {/* Phone Number Input */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            Phone Number *
                        </label>
                        <input 
                            type="tel"
                            required
                            placeholder="Enter contact number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 border border-zinc-700 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-yellow-500"
                        />
                    </div>

                    {/* Delivery Address Input */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            Delivery Address *
                        </label>
                        <textarea 
                            required
                            rows="2"
                            placeholder="House no, street, landmark..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-zinc-900 text-white placeholder-zinc-500 border border-zinc-700 rounded-lg p-2.5 text-sm font-medium focus:outline-none focus:border-yellow-500"
                        />
                    </div>

                    {/* Payment Method Option */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                            Payment Method
                        </label>
                        <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-sm text-zinc-300 font-medium flex items-center justify-between">
                            <span>Cash on Delivery</span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold">Active</span>
                        </div>
                    </div>

                    {/* Submit Order Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Placing Order...' : `Place Order • ₹${totalPrice}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;