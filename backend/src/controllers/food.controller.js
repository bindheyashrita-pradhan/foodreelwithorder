const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const { v4: uuid } = require("uuid");

async function createFood(req, res) {
  try {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

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
    const foodItems = await foodModel.find({});
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

    // Safety check if request came from non-logged in user or food-partner
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

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSaveFood
};