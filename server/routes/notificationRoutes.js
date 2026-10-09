
const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddlware");

// GET: Fetch logged-in user's notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .populate("relatedTask", "title status")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
});

// PUT: Mark one notification as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.userId,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      message: "Failed to update notification",
    });
  }
});

// PUT: Mark all notifications as read
router.put("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({
      message: "Failed to update notifications",
    });
  }
});

module.exports = router;
