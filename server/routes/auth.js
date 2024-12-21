// Contributors: Samuel Ren

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { validateUser } = require("../middleware");
const User = require("../models/user");
const config = require("../config");
const { checkIsMcGillMember } = require("../utils");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      config.secretKey,
      { expiresIn: "1h" }
    );

    // send successful login response
    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });
  } catch (error) {
    // handle any unexpected errors
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// POST /api/auth/register
router.post("/register", validateUser, async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  // server-side validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // password validation
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // email validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Implement user creation
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const isMcGillMember = checkIsMcGillMember(email);

    if (!isMcGillMember) {
      return res.status(400).json({
        message: "Only McGill students and staff can register",
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      passwordHash: password, // The pre-save hook in user.js will hash this
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);

    // handle specific mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    // generic server error
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// PUT /api/auth/password
router.put("/password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({
      message: "User ID, current password, and new password are required",
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Password update failed", error: error.message });
  }
});

// GET /api/auth/user/:userID
router.get("/user/:userID", async (req, res) => {
  const { userID } = req.params;

  try {
    if (!userID) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User fetch failed", error: error.message });
  }
});

module.exports = router;
