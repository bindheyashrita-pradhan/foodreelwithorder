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

        const userId = req.user?._id || req.user?.id || req.user;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User authentication required.' });
        }

        const newOrder = await Order.create({
            user: userId,
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

        // Fetch orders and populate safely
        let orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        // Attempt population safely to prevent 500 errors if model names differ
        try {
            orders = await Order.find({ user: userId })
                .populate('food')
                .populate('foodPartner', 'name restaurantName')
                .sort({ createdAt: -1 });
        } catch (popError) {
            console.warn("Population fallback warning:", popError.message);
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
        const partnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;

        let orders = await Order.find({ foodPartner: partnerId }).sort({ createdAt: -1 });

        try {
            orders = await Order.find({ foodPartner: partnerId })
                .populate('food')
                .populate('user', 'name email')
                .sort({ createdAt: -1 });
        } catch (popError) {
            console.warn("Partner population fallback warning:", popError.message);
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("GET /partner-orders server error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (Accepted, Rejected, Completed, Cancelled)
router.patch('/:orderId/status', authFoodPartnerMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const partnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;

        const order = await Order.findOneAndUpdate(
            { _id: req.params.orderId, foodPartner: partnerId },
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("PATCH order status error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;