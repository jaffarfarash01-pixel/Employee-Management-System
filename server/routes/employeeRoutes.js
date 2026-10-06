const express = require("express");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddlware");

const router = express.Router();

// create employee
router.post("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const { userId, employeeId, phone, department, position, joiningDate } =
      req.body;

    const employee = await Employee.create({
      userId,
      employeeId,
      phone,
      department,
      position,
      joiningDate,
    });
    res.status(201).json({
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

// GET MY PROFILE
router.get("/me", protect, authorize("employee"), async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user.userId,
    })
      .populate("userId", "name email role")
      .populate("department", "name description manager");

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET ALL EMPLOYEES
router.get("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    let employees;

    // ADMIN → see all employees
    if (req.user.role === "admin") {
      employees = await Employee.find()
        .populate("userId", "name email role")
        .populate("department", "name description manager");
    }

    // MANAGER → see employees from their department
    else if (req.user.role === "manager") {
      const departments = await Department.find({
        manager: req.user.userId,
      });

      const departmentIds = departments.map((department) => department._id);

      employees = await Employee.find({
        department: { $in: departmentIds },
      })
        .populate("userId", "name email role")
        .populate("department", "name description manager");
    }

    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET ONE EMPLOYEE
router.get(
  "/:id",
  protect,
  authorize("admin", "manager", "employee"),
  async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id)
        .populate("userId", "name email role")
        .populate("department", "name description manager");

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      // EMPLOYEE → can only view their own profile
      if (req.user.role === "employee") {
        if (employee.userId._id.toString() !== req.user.userId) {
          return res.status(403).json({
            message: "You can only view your own profile",
          });
        }
      }

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      // MANAGER → can view employees from their department
      if (req.user.role === "manager") {
        const department = await Department.findById(employee.department._id);

        if (!department) {
          return res.status(404).json({
            message: "Department not found",
          });
        }

        if (department.manager.toString() !== req.user.userId) {
          return res.status(403).json({
            message: "You can only view employees in your department",
          });
        }
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  },
);
// Update employee
router.put("/:id", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Manager can update only employees in their department
    if (req.user.role === "manager") {
      const department = await Department.findById(employee.department);

      if (!department || department.manager.toString() !== req.user.userId) {
        return res.status(403).json({
          message: "You can only update employees in your department",
        });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Delete employee
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Delete employee profile
    await Employee.findByIdAndDelete(req.params.id);

    // Delete associated user account
    await User.findByIdAndDelete(employee.userId);

    res.json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;
