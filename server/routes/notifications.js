const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Notification = require("../models/notification");

// GET /api/notifications/:userID
router.get("/:userID", async (req, res) => {
  const userID = req.params.userID;

  try {
    const user = await User.findById(userID).populate({
      path: "Notifications",
      options: { sort: { date: -1 } }, // Sort notifications by date
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.Notifications);
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
});

// DELETE /api/notifications/:notificationID
router.delete("/:notificationID", async (req, res) => {
  const notificationID = req.params.notificationID;

  try {
    // First find and delete the notification to get the user reference
    const notification = await Notification.findById(notificationID);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Update user by pulling the notification from their array
    await User.findByIdAndUpdate(notification.user, {
      $pull: { Notifications: notificationID },
    });

    // Delete the notification document
    await notification.deleteOne();

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting notification",
      error: error.message,
    });
  }
});

// DELETE /api/notifications/all/:userID
router.delete("/all/:userID", async (req, res) => {
  const userID = req.params.userID;

  try {
    const user = await User.findById(userID).populate("Notifications");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all notification documents
    const notificationIds = user.Notifications.map(
      (notification) => notification._id
    );
    await Notification.deleteMany({ _id: { $in: notificationIds } });

    // Clear the notifications array in the user document
    user.Notifications = [];
    await user.save();

    return res.status(200).json({
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting notifications",
      error: error.message,
    });
  }
});

module.exports = router;
