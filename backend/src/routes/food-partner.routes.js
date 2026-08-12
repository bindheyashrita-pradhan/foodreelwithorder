const express = require('express');
const router = express.Router();
const FoodPartner = require('../models/foodpartner.model'); // adjust path if needed
const Food = require('../models/food.model'); // adjust path if needed

// Get partner profile details + their uploaded food videos
router.get('/:id', async (req, res) => {
    try {
        const partnerId = req.params.id;

        const partner = await FoodPartner.findById(partnerId).select('-password');
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Food Partner not found' });
        }

        // Fetch all food items created by this partner
        const foodItems = await Food.find({ foodPartner: partnerId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            foodPartner: {
                ...partner.toObject(),
                foodItems: foodItems,
                fooditems: foodItems
            }
        });
    } catch (error) {
        console.error("Error fetching partner profile:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;