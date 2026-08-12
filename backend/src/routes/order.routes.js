const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const { 
    authUserMiddleware, 
    authFoodPartnerMiddleware 
} = require('../middlewares/auth.middleware');

const router = express.Router();

// ---------------- CUSTOMER ROUTES ----------------

// Place a new order
router.post('/create', authUserMiddleware, async (req, res) => {
    try {
        const { foodId, foodPartnerId, portion, price, quantity, phone, phoneNumber, deliveryAddress } = req.body;

        const userId = req.user?._id || req.user?.id || req.user;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User authentication required.' });
        }

        const validPartnerId = mongoose.Types.ObjectId.isValid(foodPartnerId)
            ? new mongoose.Types.ObjectId(foodPartnerId)
            : foodPartnerId;

        const contactPhone = phone || phoneNumber || '';

        const newOrder = await Order.create({
            user: userId,
            food: foodId,
            foodPartner: validPartnerId,
            portion: portion || 'Standard',
            price,
            quantity: quantity || 1,
            phone: contactPhone,
            phoneNumber: contactPhone,
            deliveryAddress
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders for logged-in customer
router.get('/my-orders', authUserMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.user;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User authentication required.' });
        }

        let orders = [];
        try {
            orders = await Order.find({ user: userId })
                .populate('food')
                .populate('foodPartner', 'name restaurantName')
                .sort({ createdAt: -1 });
        } catch (popError) {
            orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("GET /my-orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ---------------- FOOD PARTNER ROUTES ----------------

// Get all orders received by logged-in food partner
router.get('/partner-orders', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const rawPartnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;
        if (!rawPartnerId) {
            return res.status(401).json({ success: false, message: 'Partner authentication required.' });
        }

        const partnerObjectId = mongoose.Types.ObjectId.isValid(rawPartnerId)
            ? new mongoose.Types.ObjectId(rawPartnerId)
            : rawPartnerId;

        let orders = await Order.find({
            $or: [
                { foodPartner: partnerObjectId },
                { foodPartner: rawPartnerId.toString() }
            ]
        }).sort({ createdAt: -1 });

        try {
            orders = await Order.find({
                $or: [
                    { foodPartner: partnerObjectId },
                    { foodPartner: rawPartnerId.toString() }
                ]
            })
            .populate('food')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        } catch (popErr) {
            console.warn("Population fallback warning:", popErr.message);
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("GET /partner-orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status
router.patch('/:orderId/status', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("PATCH order status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});



// Delete an order (Allowed for both the Customer who placed it AND the Food Partner who received it)
router.delete('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Extract user or partner ID from req object or Authorization token header/cookies
        const userId = req.user?._id || req.user?.id || req.user;
        const partnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;

        // Perform deletion
        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error("Delete order error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;