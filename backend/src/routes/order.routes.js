import express from 'express';
import Order from '../models/order.model.js';
import { authUser } from '../middlewares/auth.middleware.js';  // Adjusting path if using auth middleware

const router = express.router();

//Place a new order
router.post('/create', authUser, async (req, res) => {
    try {
        const { foodId, foodPartnerId, portion, price, quantity, deiveryAddress } =  req.body;
    
        const newOrder = await Order.create({
            user: req.user._id,
            food: foodId,
            foodPartner: foodPartnerId,
            portion,
            price,
            quantity,
            deliveryAddress
        });

        res,status(201).json({ success: true, order: newOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

//Get all orders for a cutomer
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

export default router;
