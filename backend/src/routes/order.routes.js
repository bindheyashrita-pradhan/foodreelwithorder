const express = require('express');
const Order = require('../models/order.model');
const { authUser } = require('../middlewares/auth.middleware');

const router = express.Router(); // Fixed: Capitalized 'R'

// Place a new order
router.post('/create', authUser, async (req, res) => {
    try {
        // Fixed: Corrected spelling to deliveryAddress
        const { foodId, foodPartnerId, portion, price, quantity, deliveryAddress } = req.body;

        const newOrder = await Order.create({
            user: req.user._id,
            food: foodId,
            foodPartner: foodPartnerId,
            portion,
            price,
            quantity: quantity || 1,
            deliveryAddress
        });

        // Fixed: Changed res,status to res.status
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders for a customer
router.get('/my-orders', authUser, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('food')
            .populate('foodPartner', 'name restaurantName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;