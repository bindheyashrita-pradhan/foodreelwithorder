import React, { useState, useEffect } from 'react';
import '../styles/comment-modal.css'; // Reuses modal styles

const OrderModal = ({ partner, foods = [], onClose }) => {
  // 1. Get logged-in user from localStorage to auto-fill details
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [selectedFood, setSelectedFood] = useState(foods[0] || null);
  const [size, setSize] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Update selected portion/size whenever selected food item changes
  useEffect(() => {
    if (foods.length > 0 && !selectedFood) {
      setSelectedFood(foods[0]);
    }
  }, [foods]);

  // Calculate dynamic price based on the selected food item's portions or base price
  const getUnitPrice = () => {
    if (!selectedFood) return 0;
    
    // Check if the item has custom portion pricing defined
    if (selectedFood.portions && selectedFood.portions[size]) {
      return selectedFood.portions[size];
    }
    
    // Fallback to base price or default calculation
    const basePrice = selectedFood.price || 150;
    if (size === 'small') return Math.round(basePrice * 0.8);
    if (size === 'large') return Math.round(basePrice * 1.3);
    return basePrice; // medium/regular
  };

  const unitPrice = getUnitPrice();
  const totalPrice = unitPrice * quantity;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!address || !phone) {
      alert("Please enter delivery address and phone number.");
      return;
    }

    const orderData = {
      partnerName: partner?.name,
      foodName: selectedFood?.name,
      category: selectedFood?.category || 'Veg',
      size,
      quantity,
      unitPrice,
      totalPrice,
      customerName: storedUser.fullName || storedUser.name || 'Customer',
      customerEmail: storedUser.email,
      phone,
      address,
      paymentMethod
    };

    console.log("Order Placed Successfully:", orderData);
    setOrderPlaced(true);
  };

  return (
    <div className="comment-modal-backdrop" onClick={onClose}>
      <div className="comment-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto', padding: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Order from {partner?.name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {orderPlaced ? (
          /* Order Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>🎉</h1>
            <h3>Order Confirmed!</h3>
            <p>Your order for <strong>{quantity}x {selectedFood?.name} ({size.toUpperCase()})</strong> has been placed with {partner?.name}.</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Total Amount: <strong>₹{totalPrice}</strong> ({paymentMethod})</p>
            <button className="auth-submit" style={{ marginTop: '20px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={onClose}>
              Back to Store
            </button>
          </div>
        ) : (
          /* Ordering Form */
          <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Step A: Select Food Item */}
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Select Food Item</label>
              <select 
                value={selectedFood?._id || ''} 
                onChange={(e) => setSelectedFood(foods.find(f => f._id === e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
              >
                {foods.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.category === 'Non-Veg' ? '🔴' : '🟢'} {item.name} — ₹{item.price || 150}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Item Preview */}
            {selectedFood && (
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                {selectedFood.video && (
                  <video src={selectedFood.video} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px' }}>{selectedFood.category === 'Non-Veg' ? '🔴' : '🟢'}</span>
                    <strong>{selectedFood.name}</strong>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {selectedFood.description || 'Delicious meal prepared fresh!'}
                  </p>
                </div>
              </div>
            )}

            {/* Step B: Portion & Quantity Selection */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Portion Size</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                  <option value="small">Small (₹{selectedFood?.portions?.small || Math.round((selectedFood?.price || 150) * 0.8)})</option>
                  <option value="medium">Medium / Reg (₹{selectedFood?.portions?.medium || selectedFood?.price || 150})</option>
                  <option value="large">Large (₹{selectedFood?.portions?.large || Math.round((selectedFood?.price || 150) * 1.3)})</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '5px 0' }} />

            {/* Step C: Customer Details (Auto-filled) */}
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Customer Name</label>
              <input type="text" value={storedUser.fullName || storedUser.name || ''} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: '#f1f5f9' }} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Email Address</label>
              <input type="email" value={storedUser.email || ''} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', background: '#f1f5f9' }} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Phone Number *</label>
              <input type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Delivery Address *</label>
              <textarea placeholder="House no, street, landmark..." value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            </div>

            {/* Step D: Payment Option */}
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <option value="COD">Cash on Delivery</option>
                <option value="UPI">UPI / Online Test Payment</option>
              </select>
            </div>

            {/* Submit Button */}
            <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '15px' }}>
              Confirm & Pay ₹{totalPrice}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default OrderModal;