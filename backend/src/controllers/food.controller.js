const mongoose = require('mongoose');
const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const commentModel = require('../models/comment.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require("uuid");

// 🟢 FIX: Register both foodPartner and foodpartner aliases so Mongoose .populate() never throws a Schema error
try {
  const partnerModel = require('../models/foodpartner.model');
  if (!mongoose.models.foodPartner && mongoose.models.foodpartner) {
    mongoose.model('foodPartner', partnerModel.schema);
  }
} catch (e) {}

// Helper: Safely extract user ID from request header token or cookies
const getUserIdFromRequest = (req) => {
  try {
    let token = req.cookies?.token || req.cookies?.userToken;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (token && process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id || decoded._id || null;
    }
  } catch (e) {}
  return null;
};

// 🟢 1. CREATE FOOD
async function createFood(req, res) {
  try {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, `${uuid()}.mp4`);

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

// 🟢 2. GET ALL FOOD ITEMS (Includes isLiked & isSaved status for logged-in user)
async function getFoodItems(req, res) {
  try {
    let rawFoodItems = [];

    try {
      rawFoodItems = await foodModel
        .find({})
        .populate('foodPartner', 'name restaurantName email');
    } catch (popError) {
      console.warn("Populate warning in getFoodItems, using fallback query:", popError.message);
      rawFoodItems = await foodModel.find({});
    }

    const userId = getUserIdFromRequest(req);
    let userLikedFoodIds = new Set();
    let userSavedFoodIds = new Set();

    if (userId) {
      if (likeModel) {
        try {
          const userLikes = await likeModel.find({ user: userId }).select('food');
          userLikes.forEach(l => {
            if (l.food) userLikedFoodIds.add(l.food.toString());
          });
        } catch (lErr) {}
      }

      if (saveModel) {
        try {
          const userSaves = await saveModel.find({ user: userId }).select('food');
          userSaves.forEach(s => {
            if (s.food) userSavedFoodIds.add(s.food.toString());
          });
        } catch (sErr) {}
      }
    }

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

          const foodIdStr = item._id.toString();

          return {
            ...doc,
            commentsCount: doc.commentsCount || commentsCount || 0,
            isLiked: userLikedFoodIds.has(foodIdStr),
            isSaved: userSavedFoodIds.has(foodIdStr)
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
      await likeModel.deleteOne({ _id: isAlreadyLiked._id });

      const updatedFood = await foodModel.findByIdAndUpdate(
        foodId,
        { $inc: { likeCount: -1 } },
        { new: true }
      );

      const count = Math.max(0, updatedFood?.likeCount || 0);

      return res.status(200).json({
        success: true,
        message: "Food unliked successfully",
        liked: false,
        likeCount: count
      });
    }

    await likeModel.create({
      user: user._id,
      food: foodId
    });

    const updatedFood = await foodModel.findByIdAndUpdate(
      foodId,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Food liked successfully",
      liked: true,
      likeCount: updatedFood?.likeCount || 1
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
      await saveModel.deleteOne({ _id: isAlreadySaved._id });

      const updatedFood = await foodModel.findByIdAndUpdate(
        foodId,
        { $inc: { saveCount: -1 } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Food Unsaved successfully",
        saved: false,
        saveCount: Math.max(0, updatedFood?.saveCount || 0)
      });
    }

    await saveModel.create({
      user: user._id,
      food: foodId
    });

    const updatedFood = await foodModel.findByIdAndUpdate(
      foodId,
      { $inc: { saveCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Food saved successfully",
      saved: true,
      saveCount: updatedFood?.saveCount || 1
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