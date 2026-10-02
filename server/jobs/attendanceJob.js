const cron = require("node-cron");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

const markDailyAttendance = async () => {
  try {
    console.log("Running daily attendance job...");

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active employees
    const employees = await Employee.find({
      status: "active",
    });

    for (const employee of employees) {
      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        employee: employee.userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      // Already has attendance
      if (existingAttendance) {
        continue;
      }

      // Check approved leave
      const approvedLeave = await Leave.findOne({
        employee: employee.userId,
        approvalStatus: "approved",
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
      });

      if (approvedLeave) {
        await Attendance.create({
          employee: employee.userId,
          date: startOfDay,
          status: "on-leave",
        });

        console.log(
          `${employee.userId} marked as ON LEAVE`
        );
      } else {
        await Attendance.create({
          employee: employee.userId,
          date: startOfDay,
          status: "absent",
        });

        console.log(
          `${employee.userId} marked as ABSENT`
        );
      }
    }

    console.log("Daily attendance job completed.");
  } catch (error) {
    console.error(
      "Attendance job error:",
      error.message
    );
  }
};

// Run automatically every day at 11:59 PM
cron.schedule(
  "59 23 * * *",
  async () => {
    await markDailyAttendance();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

module.exports = {
  markDailyAttendance,
};