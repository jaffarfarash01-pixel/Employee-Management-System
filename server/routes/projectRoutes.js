const express = require("express");
const Project = require("../models/Project");
const Department = require("../models/Department");

const { protect, authorize } = require("../middleware/authMiddlware");
const projectOwner = require("../middleware/projectOwner");

const router = express.Router();

// CREATE PROJECT
// CREATE PROJECT
router.post(
  "/",
  protect,
  authorize("admin", "manager"),
  projectOwner,
  async (req, res) => {
    try {
      console.log("CREATE PROJECT BODY:", req.body);
      console.log("LOGGED IN USER:", req.user);

      const {
        name,
        description,
        department,
        manager,
        startDate,
        endDate,
        status,
      } = req.body;

      console.log("ABOUT TO CREATE PROJECT");

      const project = await Project.create({
        name,
        description,
        department,
        manager,
        startDate,
        endDate,
        status,
      });

      console.log("PROJECT CREATED:", project);

      res.json({
        message: "Project Created successfully",
        project,
      });
    } catch (error) {
      console.error("CREATE PROJECT ERROR:", error);

      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// GET ONE PROJECT
router.get(
  "/:id",
  protect,
  authorize("admin", "manager"),
  projectOwner,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate("department", "name description")
        .populate("manager", "name email role");

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  },
);

// GET ALL PROJECTS
router.get("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    let projects;

  // ADMIN → see all projects
if (req.user.role === "admin") {
  projects = await Project.find()
    .populate("department", "name description manager")
    .populate("manager", "name email role");
}

    // MANAGER → see only their department projects
    else if (req.user.role === "manager") {
      const departments = await Department.find({
        manager: req.user.userId,
      });

      const departmentIds = departments.map((department) => department._id);

      projects = await Project.find({
        department: { $in: departmentIds },
      })
        .populate("department", "name description manager")
        .populate("manager", "name email role");
    }

    res.json(projects);
  } catch (error) {
  console.error("GET PROJECTS ERROR:", error);
  res.status(500).json({ message: error.message });
}
});
// UPDATE
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  projectOwner,
  async (req, res) => {
    try {
      const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project Not Found",
        });
      }

      res.json({
        message: "Project Updated Successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  },
);
// DELETE
router.delete(
  "/:id",
  protect,
  authorize("admin", "manager"),
  projectOwner,
  async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }
      res.json({
        message: "project Deleted Successfully",
        project,
      });
    } catch (error) {
      res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  },
);
module.exports = router;
