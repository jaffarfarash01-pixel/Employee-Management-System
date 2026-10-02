const express = require("express");
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const { protect, authorize } = require("../middleware/authMiddlware");

const router = express.Router();

router.post("/", protect, authorize("employee"), async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      description,
    } = req.body;

    // Find employee profile
    const employee = await Employee.findOne({
      userId: req.user.userId,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found",
      });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);

    const duration =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Create leave
    const leave = await Leave.create({
      employee: req.user.userId,
      leaveType,
      startDate,
      endDate,
      duration,
      reason,
      description,
    });

    res.status(201).json({
      message: "Leave request submitted successfully",
      leave,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET MY LEAVES
router.get(
  "/my-leaves",
  protect,
  authorize("employee"),
  async (req, res) => {
    try {
      const leaves = await Leave.find({
        employee: req.user.userId,
      })
        .populate("employee", "name email role")
        .sort({ createdAt: -1 });

      res.json(leaves);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// GET LEAVE REQUESTS
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      let leaves;

      // ADMIN → See all leaves
      if (req.user.role === "admin") {
        leaves = await Leave.find()
          .populate("employee", "name email role")
          .sort({ createdAt: -1 });
      }

      // MANAGER → See leaves from their department
      else if (req.user.role === "manager") {
        // Find departments managed by this manager
        const departments = await Department.find({
          manager: req.user.userId,
        });

        const departmentIds = departments.map(
          (department) => department._id
        );

        // Find employees in those departments
        const employees = await Employee.find({
          department: { $in: departmentIds },
        });

        const employeeUserIds = employees.map(
          (employee) => employee.userId
        );

        // Find leaves of those employees
        leaves = await Leave.find({
          employee: { $in: employeeUserIds },
        })
          .populate("employee", "name email role")
          .sort({ createdAt: -1 });
      }

      res.json(leaves);

    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// APPROVE / REJECT LEAVE
router.put(
  "/:id",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      const { approvalStatus, reviewMessage } = req.body;

      // Check valid status
      if (!["approved", "rejected"].includes(approvalStatus)) {
        return res.status(400).json({
          message: "Status must be approved or rejected",
        });
      }

      // Find leave
      const leave = await Leave.findById(req.params.id);

      if (!leave) {
        return res.status(404).json({
          message: "Leave request not found",
        });
      }

      // MANAGER → check department ownership
      if (req.user.role === "manager") {
        const employee = await Employee.findOne({
          userId: leave.employee,
        });

        if (!employee) {
          return res.status(404).json({
            message: "Employee profile not found",
          });
        }

        const department = await Department.findById(
          employee.department
        );

        if (!department) {
          return res.status(404).json({
            message: "Department not found",
          });
        }

        // Manager can approve only their department's employee
        if (
          !department.manager ||
          department.manager.toString() !== req.user.userId
        ) {
          return res.status(403).json({
            message: "You can only review leaves from your department",
          });
        }
      }

      // Update leave
      leave.approvalStatus = approvalStatus;
      leave.reviewedBy = req.user.userId;
      leave.reviewMessage = reviewMessage;

      await leave.save();

      const updatedLeave = await Leave.findById(leave._id)
        .populate("employee", "name email role")
        .populate("reviewedBy", "name email role");

      res.json({
        message: `Leave ${approvalStatus} successfully`,
        leave: updatedLeave,
      });

    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;