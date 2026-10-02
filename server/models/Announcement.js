const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    audience: {
      type: String,
      enum: ["all", "department"],
      default: "all",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Announcement = mongoose.model("Announcement", announcementSchema);
module.exports = Announcement;