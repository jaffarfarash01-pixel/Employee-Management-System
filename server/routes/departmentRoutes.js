const express = require("express");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const Project = require("../models/Project");
const { protect, authorize } = require("../middleware/authMiddlware");

const router = express.Router();

// CREATE DEPARTMENT
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, manager } = req.body;

    const existingDepartment = await Department.findOne({ name });
    if (existingDepartment) {
      return res.status(400).json({
        message: "Department already exists",
      });
    }

    const department = await Department.create({
      name,
      description,
      manager,
    });
    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET ALL DEPARTMENTS
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      let departments;

      if (req.user.role === "manager") {
        // Manager can see only their own department
        departments = await Department.find({
          manager: req.user.userId,
        }).populate(
          "manager",
          "name email role"
        );
      } else {
        // Admin can see all departments
        departments = await Department.find().populate(
          "manager",
          "name email role"
        );
      }

      res.json(departments);
    } catch (error) {
      res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  }
);

// GET ONE DEPARTMENT
router.get(
  "/:id",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      const department = await Department.findById(
        req.params.id
      ).populate(
        "manager",
        "name email role"
      );

      if (!department) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      // Manager can only view their own department
      if (
        req.user.role === "manager" &&
        department.manager?._id.toString() !==
          req.user.userId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this department",
        });
      }

      res.json(department);
    } catch (error) {
      res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  }
);

// UPDATE DEPARTMENT
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, manager, status } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        manager,
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate("manager", "name email role");

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }
    
    res.json({
        message:"Department Updated successsfully",
        department,
    });

  } catch (error) {
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

// DELETE DEPARTMENT
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const departmentId = req.params.id;

      // Check department exists
      const department = await Department.findById(departmentId);

      if (!department) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      // Check employees using this department
      const employeeCount = await Employee.countDocuments({
        department: departmentId,
      });

      if (employeeCount > 0) {
        return res.status(400).json({
          message:
            "Cannot delete department because employees are assigned to it",
          employeeCount,
        });
      }

      // Check projects using this department
      const projectCount = await Project.countDocuments({
        department: departmentId,
      });

      if (projectCount > 0) {
        return res.status(400).json({
          message:
            "Cannot delete department because projects are assigned to it",
          projectCount,
        });
      }

      // Delete department
      await Department.findByIdAndDelete(departmentId);

      res.json({
        message: "Department deleted successfully",
        department,
      });
    } catch (error) {
      res.status(500).json({
        message: "server error",
        error: error.message,
      });
    }
  }
);
module.exports = router;
