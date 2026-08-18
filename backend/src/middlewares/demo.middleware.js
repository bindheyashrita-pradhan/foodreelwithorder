// ==========================================
// ⚙️ TOGGLE SWITCH: Set to false to disable restrictions!
// ==========================================
const DEMO_MODE = process.env.DEMO_MODE !== 'false'; // Defaults to true

// Restrict registrations
const restrictRegistration = (req, res, next) => {
    if (DEMO_MODE) {
        return res.status(403).json({
            success: false,
            message: "🔒 Account registration is disabled in Demo Mode. Please use the provided Demo login credentials."
        });
    }
    next();
};

// Restrict video uploads
const restrictUploads = (req, res, next) => {
    if (DEMO_MODE) {
        return res.status(403).json({
            success: false,
            message: "🔒 Video uploads are disabled in public Demo Mode to preserve server storage."
        });
    }
    next();
};

// Restrict comments
const restrictComments = (req, res, next) => {
    if (DEMO_MODE) {
        return res.status(403).json({
            success: false,
            message: "🔒 Adding comments is disabled in public Demo Mode to prevent spam."
        });
    }
    next();
};

module.exports = {
    DEMO_MODE,
    restrictRegistration,
    restrictUploads,
    restrictComments
};