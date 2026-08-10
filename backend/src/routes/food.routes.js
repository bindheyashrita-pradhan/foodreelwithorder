const express = require('express');
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
});

/* POST /api/food/ [protected for partners] */
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
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

/* 🟢 NEW COMMENT ROUTES */
// POST /api/food/:foodId/comment (Add a comment - requires user login)
router.post('/:foodId/comment',
    authMiddleware.authUserMiddleware,
    foodController.addComment
);

// GET /api/food/:foodId/comments (Fetch all comments for a video)
router.get('/:foodId/comments',
    foodController.getComments
);


// Edit comment (requires authentication)
router.put('/comment/:commentId', authMiddleware.authUserMiddleware, foodController.editComment);

// Delete comment (requires authentication)
router.delete('/comment/:commentId', authMiddleware.authUserMiddleware, foodController.deleteComment);

module.exports = router;