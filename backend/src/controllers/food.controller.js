const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const commentModel = require('../models/comment.model');
const userModel = require('../models/user.model');
const { v4: uuid } = require("uuid");

// Pre-load food partner model to prevent Mongoose population errors
try {
  require('../models/foodpartner.model');
} catch (e) {}

// 🟢 1. CREATE FOOD
async function createFood(req, res) {
  try {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, `${uuid()}.mp4`);

    // Safe handling for price and portions passed via FormData
    const price = req.body.price ? Number(req.body.price) : 0;
    const category = req.body.category || 'Veg';

    let portions = { small: 0, medium: price, large: 0 };
    if (req.body.portions) {
      try {
        const parsedPortions = typeof req.body.portions === 'string' 
          ? JSON.parse(req.body.portions) 
          : req.body.portions;

        portions = {
          small: Number(parsedPortions.small) || 0,
          medium: Number(parsedPortions.medium) || price,
          large: Number(parsedPortions.large) || 0
        };
      } catch (e) {
        console.warn("Portions parsing fallback:", e.message);
      }
    }

    const partnerId = req.foodPartner?._id || req.foodPartner?.id || req.foodPartner;

    const foodItem = await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      price: price,
      category: category,
      portions: portions,
      video: fileUploadResult.url,
      foodPartner: partnerId
    });

    res.status(201).json({
      success: true,
      message: "food created successfully",
      food: foodItem
    });
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 🟢 2. GET ALL FOOD ITEMS (SAFE FETCH)
async function getFoodItems(req, res) {
  try {
    let rawFoodItems = [];

    // Try fetching with populate, or fall back to plain query if populate fails
    try {
      rawFoodItems = await foodModel
        .find({})
        .populate('foodPartner', 'name restaurantName email');
    } catch (popError) {
      console.warn("Populate failed in getFoodItems, running fallback query:", popError.message);
      rawFoodItems = await foodModel.find({});
    }

    // Attach real-time comment count safely
    const foodItems = await Promise.all(
      rawFoodItems.map(async (item) => {
        try {
          const doc = item.toObject ? item.toObject() : item;
          let commentsCount = 0;

          if (commentModel) {
            try {
              commentsCount = await commentModel.countDocuments({ food: item._id });
            } catch (cErr) {}
          }

          return {
            ...doc,
            commentsCount: doc.commentsCount || commentsCount || 0
          };
        } catch (e) {
          return item.toObject ? item.toObject() : item;
        }
      })
    );

    res.status(200).json({
      success: true,
      message: "Food items fetched successfully",
      foodItems,
      foods: foodItems
    });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 🟢 3. LIKE FOOD
async function likeFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "User not authenticated. Please log in as a user." });
    }

    if (!foodId) {
      return res.status(400).json({ success: false, message: "foodId is required" });
    }

    const isAlreadyLiked = await likeModel.findOne({
      user: user._id,
      food: foodId
    });

    if (isAlreadyLiked) {
      await likeModel.deleteOne({
        user: user._id,
        food: foodId
      });

      await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: -1 }
      });

      return res.status(200).json({
        success: true,
        message: "Food unliked successfully"
      });
    }

    const like = await likeModel.create({
      user: user._id,
      food: foodId
    });

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { likeCount: 1 }
    });

    return res.status(201).json({
      success: true,
      message: "Food liked successfully",
      like
    });
  } catch (error) {
    console.error("Error in likeFood:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 🟢 4. SAVE FOOD (BOOKMARK)
async function saveFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "User not authenticated. Please log in as a user." });
    }

    if (!foodId) {
      return res.status(400).json({ success: false, message: "foodId is required" });
    }

    const isAlreadySaved = await saveModel.findOne({
      user: user._id,
      food: foodId
    });

    if (isAlreadySaved) {
      await saveModel.deleteOne({
        user: user._id,
        food: foodId
      });

      await foodModel.findByIdAndUpdate(foodId, {
        $inc: { saveCount: -1 }
      });

      return res.status(200).json({
        success: true,
        message: "Food Unsaved successfully"
      });
    }

    const save = await saveModel.create({
      user: user._id,
      food: foodId
    });

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { saveCount: 1 }
    });

    return res.status(201).json({
      success: true,
      message: "Food saved successfully",
      save
    });
  } catch (error) {
    console.error("Error in saveFood:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 🟢 5. GET SAVED FOOD
async function getSaveFood(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
      return res.status(404).json({ success: false, message: "No saved foods found" });
    }

    res.status(200).json({
      success: true,
      message: "Saved foods fetched successfully",
      savedFoods
    });
  } catch (error) {
    console.error("Error in getSaveFood:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// 🟢 6. ADD COMMENT
async function addComment(req, res) {
  try {
    const { foodId } = req.params;
    const { text } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "comment text cannot be empty" });
    }

    const newComment = await commentModel.create({
      user: userId,
      food: foodId,
      text: text.trim()
    });

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { commentsCount: 1, commentCount: 1 }
    });

    let populatedComment;
    try {
      populatedComment = await commentModel
        .findById(newComment._id)
        .populate('user', 'fullName name email');
    } catch (popError) {
      console.warn("Population fallback:", popError.message);
      populatedComment = newComment;
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}

// 🟢 7. GET COMMENTS
async function getComments(req, res) {
  try {
    const { foodId } = req.params;

    let comments = [];
    try {
      comments = await commentModel
        .find({ food: foodId })
        .populate('user', 'fullName name email')
        .sort({ createdAt: -1 });
    } catch (popError) {
      console.warn("Population fallback on fetch:", popError.message);
      comments = await commentModel
        .find({ food: foodId })
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}

// 🟢 8. EDIT COMMENT
async function editComment(req, res) {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text cannot be empty" });
    }

    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this comment" });
    }

    comment.text = text.trim();
    await comment.save();

    let updatedComment;
    try {
      updatedComment = await commentModel.findById(comment._id).populate('user', 'fullName name email');
    } catch (popErr) {
      updatedComment = comment;
    }

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}

// 🟢 9. DELETE COMMENT
async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    const foodId = comment.food;
    await commentModel.findByIdAndDelete(commentId);

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { commentsCount: -1, commentCount: -1 }
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentId
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSaveFood,
  addComment,
  getComments,
  editComment,
  deleteComment
};