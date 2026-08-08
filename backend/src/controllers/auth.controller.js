const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cookie options required for Netlify (frontend) + Render (backend) cross-domain cookies
const cookieOptions = {
  httpOnly: true,
  secure: true,      // HTTPS required
  sameSite: "none",  // Cross-site cookie sharing allowed
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Register a new user
async function registerUser(req, res) {
  const {fullName, email, password} = req.body;
  const isUserAlreadyExists = await userModel.findOne({ email });
  if(isUserAlreadyExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({ fullName, email, password: hashedPassword });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token, cookieOptions);
  res.status(201).json({ message: "User registered successfully", user: { id: user._id, email: user.email, fullName: user.fullName } });
}

// Log in an existing user
async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message:"Invalid email or password" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token, cookieOptions);
  res.status(200).json({ message: "User logged in successfully", user: { _id: user._id, email: user.email, fullName: user.fullName } });
}

// Log out a user
function logoutUser(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "User logged out successfully" });
}

// Register a new food partner business
async function registerFoodPartner(req, res) {
  const { name, email, password, phone, address, contactName } = req.body;
  const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });
  if (isAccountAlreadyExists) {
    return res.status(400).json({ message: "Food Partner already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const foodPartner = await foodPartnerModel.create({ name, email, password: hashedPassword, phone, address, contactName });
  const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
  res.cookie("token", token, cookieOptions);
  res.status(201).json({ message: "Food Partner registered successfully", foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name, address: foodPartner.address, contactName: foodPartner.contactName, phone: foodPartner.phone } });
}

// Log in a food partner business
async function loginFoodPartner(req, res) {
  const { email, password } = req.body;
  const foodPartner = await foodPartnerModel.findOne({ email });
  if(!foodPartner) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);
  res.cookie("token", token, cookieOptions);
  res.status(200).json({ message: "Food partner logged in successfully", foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name } });
}

// Log out a food partner business
function logoutFoodPartner(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Food partner logged out successfully" });
}

module.exports = { registerUser, loginUser, logoutUser, registerFoodPartner, loginFoodPartner, logoutFoodPartner };