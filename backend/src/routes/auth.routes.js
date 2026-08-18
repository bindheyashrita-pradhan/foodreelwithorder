const express = require('express');
const authController = require("../controllers/auth.controller");

const router = express.Router();

// =========================================================================
// ⚙️ DEMO MODE SWITCH: Set to false whenever you want to unlock registrations!
// =========================================================================
const DEMO_MODE = process.env.DEMO_MODE !== 'false'; // Defaults to true

// 🔒 Demo Guard: Blocks new registrations in demo mode
const blockRegisterInDemo = (req, res, next) => {
    if (DEMO_MODE) {
        return res.status(403).json({
            success: false,
            message: "🔒 Account registration is disabled in public Demo Mode. Please use the 1-Click Demo Login buttons on the sign-in page."
        });
    }
    next();
};
// =========================================================================

// User auth APIs
router.post('/user/register', blockRegisterInDemo, authController.registerUser);
router.post('/user/login', authController.loginUser);
router.post('/user/logout', authController.logoutUser);

// Food partner auth APIs
router.post('/food-partner/register', blockRegisterInDemo, authController.registerFoodPartner);
router.post('/food-partner/login', authController.loginFoodPartner);
router.post('/food-partner/logout', authController.logoutFoodPartner);

module.exports = router;