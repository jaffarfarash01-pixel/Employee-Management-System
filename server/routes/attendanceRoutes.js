const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const { protect, authorize } = require("../middleware/authMiddlware");

// EMPLOYEE CHECK-IN
router.post(
  "/check-in",
  protect,
  authorize("employee"),
  async (req, res) => {
    try {
      const employeeId = req.user.userId;

      // Get today's date
      const today = new Date();

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        employee: employeeId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (existingAttendance) {
  // Allow employee to check in if automatic job
  // previously marked them absent
  if (
    existingAttendance.status === "absent" &&
    !existingAttendance.checkIn
  ) {
    const checkInTime = new Date();

    const lateTime = new Date(today);
    lateTime.setHours(9, 30, 0, 0);

    let status = "present";

    if (checkInTime > lateTime) {
      status = "late";
    }

    existingAttendance.checkIn = checkInTime;
    existingAttendance.status = status;

    await existingAttendance.save();

    return res.status(200).json({
      message: "Check-in successful",
      attendance: existingAttendance,
    });
  }

  return res.status(400).json({
    message: "You have already checked in today",
  });
}

      // Current server time
      const checkInTime = new Date();

      // Example: office starts at 9:30 AM
      const lateTime = new Date(today);
      lateTime.setHours(9, 30, 0, 0);

      let status = "present";

      if (checkInTime > lateTime) {
        status = "late";
      }

      const attendance = await Attendance.create({
        employee: employeeId,
        date: startOfDay,
        checkIn: checkInTime,
        status: status,
      });

      res.status(201).json({
        message: "Check-in successful",
        attendance,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// EMPLOYEE CHECK-OUT
router.post(
  "/check-out",
  protect,
  authorize("employee"),
  async (req, res) => {
    try {
      const employeeId = req.user.userId;

      const today = new Date();

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Find today's attendance
      const attendance = await Attendance.findOne({
        employee: employeeId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      if (!attendance) {
        return res.status(400).json({
          message: "You have not checked in today",
        });
      }

      if (!attendance.checkIn) {
        return res.status(400).json({
          message: "You have not checked in today",
        });
      }

      if (attendance.checkOut) {
        return res.status(400).json({
          message: "You have already checked out today",
        });
      }

      // Current server time
      const checkOutTime = new Date();

      // Calculate working hours
      const difference =
        checkOutTime.getTime() - attendance.checkIn.getTime();

      const workingHours = difference / (1000 * 60 * 60);

      attendance.checkOut = checkOutTime;
      attendance.workingHours = Number(workingHours.toFixed(2));

      await attendance.save();

      res.status(200).json({
        message: "Check-out successful",
        attendance,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);
// EMPLOYEE ATTENDANCE HISTORY
router.get(
  "/my",
  protect,
  authorize("employee"),
  async (req, res) => {
    try {
      const employeeId = req.user.userId;

      const attendance = await Attendance.find({
        employee: employeeId,
      }).sort({ date: -1 });

      res.status(200).json(attendance);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);
// ADMIN / MANAGER - VIEW ATTENDANCE
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      let attendance;

      // ADMIN → see all attendance
      if (req.user.role === "admin") {
        attendance = await Attendance.find()
          .populate("employee", "name email role")
          .sort({ date: -1 });

        return res.status(200).json(attendance);
      }

      // MANAGER → see attendance of their department employees
      if (req.user.role === "manager") {
        const Employee = require("../models/Employee");
        const Department = require("../models/Department");

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
          status: "active",
        });

        const employeeUserIds = employees.map(
          (employee) => employee.userId
        );

        // Find attendance of those employees
        attendance = await Attendance.find({
          employee: { $in: employeeUserIds },
        })
          .populate("employee", "name email role")
          .sort({ date: -1 });

        return res.status(200).json(attendance);
      }
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);
module.exports = router;