const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/order.model');

// Pre-load food and partner models for population
try {
    require('../models/food.model');
} catch (e) {
    try { require('../models/fooditem.model'); } catch (err) {}
}
try {
    require('../models/foodpartner.model');
} catch (e) {}

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

        const rawUserId = req.user?._id || req.user?.id || req.user;
        if (!rawUserId) {
            return res.status(401).json({ success: false, message: 'User authentication required.' });
        }

        const validUserId = mongoose.Types.ObjectId.isValid(rawUserId)
            ? new mongoose.Types.ObjectId(rawUserId)
            : rawUserId;

        const validPartnerId = mongoose.Types.ObjectId.isValid(foodPartnerId)
            ? new mongoose.Types.ObjectId(foodPartnerId)
            : foodPartnerId;

        const contactPhone = phone || phoneNumber || '';

        const newOrder = await Order.create({
            user: validUserId,
            food: foodId,
            foodPartner: validPartnerId,
            portion: portion || 'Standard',
            price: Number(price) || 0,
            quantity: Number(quantity) || 1,
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
        const rawUserId = req.user?._id || req.user?.id || req.user;
        if (!rawUserId) {
            return res.status(401).json({ success: false, message: 'User authentication required.' });
        }

        const userObjectId = mongoose.Types.ObjectId.isValid(rawUserId)
            ? new mongoose.Types.ObjectId(rawUserId)
            : rawUserId;

        let orders = [];
        try {
            orders = await Order.find({
                $or: [
                    { user: userObjectId },
                    { user: rawUserId.toString() }
                ]
            })
            .populate('food')
            .populate('foodPartner', 'name restaurantName')
            .sort({ createdAt: -1 });

        } catch (popError) {
            console.warn("Population warning in /my-orders:", popError.message);
            orders = await Order.find({
                $or: [
                    { user: userObjectId },
                    { user: rawUserId.toString() }
                ]
            }).sort({ createdAt: -1 });
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

        let orders = [];
        try {
            orders = await Order.find({
                $or: [
                    { foodPartner: partnerObjectId },
                    { foodPartner: rawPartnerId.toString() }
                ]
            })
            .populate('food')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        } catch (popErr) {
            console.warn("Population fallback warning in /partner-orders:", popErr.message);
            orders = await Order.find({
                $or: [
                    { foodPartner: partnerObjectId },
                    { foodPartner: rawPartnerId.toString() }
                ]
            }).sort({ createdAt: -1 });
        }

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("GET /partner-orders error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (Accepted / Rejected / Completed)
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

// Delete an order
router.delete('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.error("Delete order error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;