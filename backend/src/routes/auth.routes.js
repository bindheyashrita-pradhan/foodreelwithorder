const express = require('express');
const authController = require("../controllers/auth.controller");

const router = express.Router();

// User auth APIs
router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.post('/user/logout', authController.logoutUser);

// Food partner auth APIs
router.post('/food-partner/register', authController.registerFoodPartner);
router.post('/food-partner/login', authController.loginFoodPartner);
router.post('/food-partner/logout', authController.logoutFoodPartner); // Updated GET to POST to match frontend auth requests

module.exports = router;