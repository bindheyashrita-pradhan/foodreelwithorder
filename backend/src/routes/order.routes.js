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
        const { foodId, foodPartnerId, portion, price, quantity, phone, deliveryAddress } = req.body;

        const userId = req.user?._id || req.user?.id || req.user;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User authentication required.' });
        }

        // Ensure partner ID is saved as a proper Mongo ObjectId
        const validPartnerId = mongoose.Types.ObjectId.isValid(foodPartnerId)
            ? new mongoose.Types.ObjectId(foodPartnerId)
            : foodPartnerId;

        const newOrder = await Order.create({
            user: userId,
            food: foodId,
            foodPartner: validPartnerId,
            portion,
            price,
            quantity: quantity || 1,
            phone,
            deliveryAddress
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders for a logged-in customer
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
        console.error("GET /my-orders server error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ---------------- FOOD PARTNER ROUTES ----------------

// Get all orders received by the logged-in food partner
router.get('/partner-orders', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const rawPartnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;

        if (!rawPartnerId) {
            return res.status(401).json({ success: false, message: 'Partner authentication required.' });
        }

        const partnerObjectId = mongoose.Types.ObjectId.isValid(rawPartnerId)
            ? new mongoose.Types.ObjectId(rawPartnerId)
            : rawPartnerId;

        // Search both by ObjectId and string ID to match any existing orders
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
            console.warn("Population fallback warning on partner-orders:", popErr.message);
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("GET /partner-orders server error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status
router.patch('/:orderId/status', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const rawPartnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;

        const order = await Order.findOneAndUpdate(
            { _id: req.params.orderId },
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

module.exports = router;