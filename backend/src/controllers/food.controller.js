const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const commentModel = require('../models/comment.model');
const userModel = require('../models/user.model');
const { v4: uuid } = require("uuid");

async function createFood(req, res) {
  try {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, `${uuid()}.mp4`);

    const foodItem = await foodModel.create({
      name: req.body.name,
      description: req.body.description,
      video: fileUploadResult.url,
      foodPartner: req.foodPartner._id
    });

    res.status(201).json({
      message: "food created successfully",
      food: foodItem
    });
  } catch (error) {
    console.error("Error creating food:", error);
    res.status(500).json({ message: error.message });
  }
}

async function getFoodItems(req, res) {
try {
  const rawFoodItems = await foodModel.find({});

  const foodItems = await Promise.all(
    rawFoodItems.map(async (item) => {
      const doc = item.toObject();
      const commentsCount = await commentModel.countDocuments({ food: item._id });
      return {
        ...doc,
        commentsCount // Real-time comment count attached
      };
    })
  );

  res.status(200).json({
    message: "Food items fetched successfully",
    foodItems
  });
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ message: error.message });
  }
}

async function likeFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated. Please log in as a user." });
    }

    if (!foodId) {
      return res.status(400).json({ message: "foodId is required" });
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
      message: "Food liked successfully",
      like
    });
  } catch (error) {
    console.error("Error in likeFood:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function saveFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated. Please log in as a user." });
    }

    if (!foodId) {
      return res.status(400).json({ message: "foodId is required" });
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
      message: "Food saved successfully",
      save
    });
  } catch (error) {
    console.error("Error in saveFood:", error);
    return res.status(500).json({ message: error.message });
  }
}

async function getSaveFood(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
      return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
      message: "Saved foods fetched successfully",
      savedFoods
    });
  } catch (error) {
    console.error("Error in getSaveFood:", error);
    res.status(500).json({ message: error.message });
  }
}

// Add a new comment to a food video
async function addComment(req, res) {
  try {
    const { foodId } = req.params;
    const { text } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "comment text cannot be empty" });
    }

    const newComment = await commentModel.create({
      user: userId,
      food: foodId,
      text: text.trim()
    });

    // 🟢 Increment comment count on the Food document
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
      message: "Comment added successfully",
      comment: populatedComment
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

// Get all comments for a food video
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

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}


// Edit an existing comment (Only by comment owner)

// Edit an existing comment
async function editComment(req, res) {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Authorization check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this comment" });
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
      message: "Comment updated successfully",
      comment: updatedComment
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

// Delete an existing comment
async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Authorization check
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    const foodId = comment.food;
    await commentModel.findByIdAndDelete(commentId);

    // Decrement comment count on Food document
    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { commentsCount: -1, commentCount: -1 }
    });

    res.status(200).json({
      message: "Comment deleted successfully",
      commentId
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
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