const foodPartnerModel = require("../models/foodpartner.model");
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');

// ==================== 🟢 IMPLEMENTATION: UPDATED TOKEN EXTRACTION ====================
// Helper to extract JWT token from cookies (token, userToken, partnerToken) OR Authorization header
const extractToken = (req) => {
    if (req.cookies) {
        if (req.cookies.token) return req.cookies.token;
        if (req.cookies.userToken) return req.cookies.userToken;
        if (req.cookies.partnerToken) return req.cookies.partnerToken;
    }
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};
// ======================================================================================

async function authFoodPartnerMiddleware(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const foodPartner = await foodPartnerModel.findById(decoded.id || decoded._id);

        if (!foodPartner) {
            return res.status(401).json({ success: false, message: "Food partner not found" });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

// ==================== 🟢 IMPLEMENTATION: UPDATED USER AUTH MIDDLEWARE ====================
async function authUserMiddleware(req, res, next) {
    // 1. Get token from cookies (token / userToken) OR Authorization header
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch full user record from database (falls back to decoded payload if user not in DB)
        const user = await userModel.findById(decoded.id || decoded._id);

        if (!user) {
            // Attach decoded payload if user document isn't directly needed from DB
            req.user = decoded;
        } else {
            req.user = user;
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
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