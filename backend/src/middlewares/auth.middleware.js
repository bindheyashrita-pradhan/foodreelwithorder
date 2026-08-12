const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');

// ==================== 🟢 IMPLEMENTATION: ENHANCED TOKEN EXTRACTION ====================
// Helper to extract JWT token: Checks Authorization header first, then falls back to cookies
const extractToken = (req) => {
    // 1. Check Authorization header (supports both lowercase 'authorization' & uppercase 'Authorization')
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    // 2. Fallback to cookies (token / userToken / partnerToken)
    if (req.cookies) {
        if (req.cookies.token) return req.cookies.token;
        if (req.cookies.userToken) return req.cookies.userToken;
        if (req.cookies.partnerToken) return req.cookies.partnerToken;
    }

    return null;
};
// ======================================================================================

async function authFoodPartnerMiddleware(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. No token provided."
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const foodPartner = await foodPartnerModel.findById(decoded.id || decoded._id);

        if (!foodPartner) {
            return res.status(401).json({ success: false, message: "Food partner not found." });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (error) {
        console.error("Auth partner middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

// ==================== 🟢 IMPLEMENTATION: UPDATED USER AUTH MIDDLEWARE ====================
async function authUserMiddleware(req, res, next) {
    try {
        // 1. Extract token (Header Bearer check first, then Cookies fallback)
        const token = extractToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. No token provided."
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch user from DB or attach decoded payload to req.user
        const user = await userModel.findById(decoded.id || decoded._id);
        req.user = user || decoded;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}
// =========================================================================================

module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware,
    // Aliases to prevent import name mismatches across different routes
    authUser: authUserMiddleware,
    authFoodPartner: authFoodPartnerMiddleware
};