const express = require('express');
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
});

// =========================================================================
// ⚙️ DEMO MODE SWITCH: Set to false whenever you want to unlock for personal use!
// =========================================================================
const DEMO_MODE = process.env.DEMO_MODE !== 'false'; // Defaults to true (Demo Mode Active)

// 🔒 Demo Guard: Blocks video uploads in demo mode
const blockUploadsInDemo = (req, res, next) => {
    if (DEMO_MODE) {
        return res.status(403).json({
            success: false,
            message: "🔒 Video uploads are disabled in public Demo Mode to preserve server storage."
        });
    }
    next();
};

// 🔒 Demo Guard: Blocks adding comments in demo mode
const blockCommentsInDemo = (req, res, next) => {
    if (DEMO_MODE) {
        return res.status(403).json({
            success: false,
            message: "🔒 Comments are disabled in public Demo Mode to prevent spam."
        });
    }
    next();
};
// =========================================================================

/* POST /api/food/ [Protected for partners + Restricted in Demo Mode] */
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    blockUploadsInDemo, // 👈 Blocks uploading videos in Demo Mode
    upload.single("video"),
    foodController.createFood
);

// Public route - anyone can see videos! ✅
router.get('/', foodController.getFoodItems);

/* POST /api/food/like */
router.post('/like', 
    authMiddleware.authUserMiddleware, 
    foodController.likeFood
);  

/* POST /api/food/save */
router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

/* GET /api/food/save */
router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
);

/* 🟢 COMMENT ROUTES */
// POST /api/food/:foodId/comment (Add comment - blocked in Demo Mode)
router.post('/:foodId/comment',
    authMiddleware.authUserMiddleware,
    blockCommentsInDemo, // 👈 Blocks spam comments in Demo Mode
    foodController.addComment
);

// GET /api/food/:foodId/comments (Fetch comments - public view)
router.get('/:foodId/comments',
    foodController.getComments
);

// Edit comment
router.put('/comment/:commentId', 
    authMiddleware.authUserMiddleware, 
    blockCommentsInDemo,
    foodController.editComment
);

// Delete comment
router.delete('/comment/:commentId', 
    authMiddleware.authUserMiddleware, 
    foodController.deleteComment
);

module.exports = router;