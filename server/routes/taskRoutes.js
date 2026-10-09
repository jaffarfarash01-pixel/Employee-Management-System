const express = require("express");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect, authorize } = require("../middleware/authMiddlware");
const Department = require("../models/Department");
const Employee = require("../models/Employee");

const router = express.Router();

// CREATE TASK
router.post("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
      status,
    } = req.body;

    // Find project
    const projectData = await Project.findById(project);

    if (!projectData) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Manager ownership check
    if (req.user.role === "manager") {
      const department = await Department.findById(projectData.department);

      if (!department) {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      if (department.manager.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only create tasks for projects in your department",
        });
      }

      // Check assigned employees
      const employees = await Employee.find({
        userId: { $in: assignedTo },
      });

      if (employees.length !== assignedTo.length) {
        return res.status(400).json({
          message: "One or more assigned users are not valid employees",
        });
      }

      // Check employees belong to manager's department
      const invalidEmployee = employees.some(
        (employee) =>
          employee.department.toString() !== projectData.department.toString(),
      );

      if (invalidEmployee) {
        return res.status(403).json({
          message: "You can only assign employees from your department",
        });
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      assignedBy: req.user.userId,
      priority,
      dueDate,
      status,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
//   GET ONE TASK
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id)
        .populate("project", "name description status")
        .populate("assignedTo", "name email role")
        .populate("assignedBy", "name email role");

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      // EMPLOYEE → can view only assigned tasks
      if (req.user.role === "employee") {
        const isAssigned = task.assignedTo.some(
          (user) => user._id.toString() === req.user.userId,
        );

        if (!isAssigned) {
          return res.status(403).json({
            message: "You can only view tasks assigned to you",
          });
        }
      }

      res.json(task);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// GET ALL TASKS
router.get(
  "/",
  protect,
  authorize("admin", "manager", "employee"),
  async (req, res) => {
    try {
      let tasks;

      if (req.user.role === "admin") {
        tasks = await Task.find()
          .populate("project", "name description status")
          .populate("assignedTo", "name email role")
          .populate("assignedBy", "name email role");
      }
      // EMPLOYEE → see only tasks assigned to them
      else if (req.user.role === "employee") {
        tasks = await Task.find({
          assignedTo: req.user.userId,
        })
          .populate("project", "name description status")
          .populate("assignedTo", "name email role")
          .populate("assignedBy", "name email role");
      }
      // MANAGER → see only their departments tasks
      else if (req.user.role === "manager") {
        const departments = await Department.find({
          manager: req.user.userId,
        });

        const departmentIds = departments.map((department) => department._id);

        // Find projects belonging to those departments
        const projects = await Project.find({
          department: { $in: departmentIds },
        });

        const projectIds = projects.map((project) => project._id);

        // Find tasks belonging to those projects
        tasks = await Task.find({
          project: { $in: projectIds },
        })
          .populate("project", "name description status")
          .populate("assignedTo", "name email role")
          .populate("assignedBy", "name email role");
      }

      res.json(tasks);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },
);

// UPDATE TASK STATUS
router.put(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  async (req, res) => {
    try {
      const { status } = req.body;

const allowedStatuses = ["todo", "in-progress", "completed"];

if (!allowedStatuses.includes(status)) {
  return res.status(400).json({
    message: "Invalid status. Use todo, in-progress, or completed.",
  });
}

      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          message: "Task not found",
        });
      }

      // EMPLOYEE → can update only their own task
      if (req.user.role === "employee") {
        const isAssigned = task.assignedTo.some(
          (userId) => userId.toString() === req.user.userId,
        );

        if (!isAssigned) {
          return res.status(403).json({
            message: "You can only update tasks assigned to you",
          });
        }
      }
       // MANAGER → only tasks from their department
      if (req.user.role === "manager") {
        const project = await Project.findById(task.project);

        if (!project) {
          return res.status(404).json({
            message: "Project not found",
          });
        }

        const department = await Department.findById(project.department);

        if (!department) {
          return res.status(404).json({
            message: "Department not found",
          });
        }

        if (department.manager.toString() !== req.user.userId) {
          return res.status(403).json({
            message: "You can only update tasks in your department",
          });
        }
      }

      // Update only status
      task.status = status;

      await task.save();

      res.json({
        message: "Task status updated successfully",
        task,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },
);
module.exports = router;
