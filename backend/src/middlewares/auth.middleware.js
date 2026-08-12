const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');

// ==================== 🟢 HELPER: ENHANCED TOKEN EXTRACTION ====================
const extractToken = (req, preferredCookieKey = null) => {
    // 1. Check Authorization header (supports 'authorization' & 'Authorization')
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) return token.trim();
    }

    // 2. Fallback to cookies
    if (req.cookies) {
        if (preferredCookieKey && req.cookies[preferredCookieKey]) {
            return req.cookies[preferredCookieKey];
        }
        return req.cookies.token || req.cookies.userToken || req.cookies.partnerToken || null;
    }

    return null;
};

// ==================== 🟢 FOOD PARTNER AUTH MIDDLEWARE ====================
async function authFoodPartnerMiddleware(req, res, next) {
    const token = extractToken(req, 'partnerToken');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const partnerId = decoded._id || decoded.id || decoded.partnerId || decoded.foodPartnerId;

        let foodPartner = null;
        if (partnerId) {
            foodPartner = await foodPartnerModel.findById(partnerId).select('-password');
        }

        if (!foodPartner && !partnerId) {
            return res.status(401).json({ success: false, message: "Food partner not found." });
        }

        // Attach food partner document (or decoded payload fallback)
        req.foodPartner = foodPartner || decoded;
        next();
    } catch (error) {
        console.error("Auth partner middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

// ==================== 🟢 USER AUTH MIDDLEWARE ====================
async function authUserMiddleware(req, res, next) {
    const token = extractToken(req, 'userToken');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded._id || decoded.id || decoded.userId;

        let user = null;
        if (userId) {
            user = await userModel.findById(userId).select('-password');
        }

        // Attach user document or decoded payload
        req.user = user || decoded;
        next();
    } catch (error) {
        console.error("Auth user middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

// ==================== 🟢 EXPORTS ====================
module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware,
    // Aliases to prevent import name mismatches across different routes
    authUser: authUserMiddleware,
    authFoodPartner: authFoodPartnerMiddleware
};