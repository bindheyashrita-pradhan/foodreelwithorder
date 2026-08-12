const express = require('express');
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

        const newOrder = await Order.create({
            user: req.user._id,
            food: foodId,
            foodPartner: foodPartnerId,
            portion,
            price,
            quantity: quantity || 1,
            phone,
            deliveryAddress
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders for a logged-in customer
router.get('/my-orders', authUserMiddleware, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const orders = await Order.find({ user: userId })
            .populate('food')
            .populate('foodPartner', 'name restaurantName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ---------------- FOOD PARTNER ROUTES ----------------

// Get all orders received by the logged-in food partner
router.get('/partner-orders', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ foodPartner: req.foodPartner._id })
            .populate('food')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (Accepted, Rejected, Completed, Cancelled)
router.patch('/:orderId/status', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.orderId, foodPartner: req.foodPartner._id },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;