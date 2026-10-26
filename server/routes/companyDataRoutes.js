
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddlware");

const User = require("../models/User");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

// POST /api/company-data/ask
router.post("/ask", protect, async (req, res) => {
  try {
    const { question } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim() ||
      question.length > 300
    ) {
      return res.status(400).json({
        message: "Enter a question of up to 300 characters.",
      });
    }

    const role = req.user.role;
    const userId = req.user.userId;

    console.log("Logged-in role:", role);
console.log("Logged-in userId:", userId);

    const text = question.toLowerCase().trim();

    // Only support employee-count questions in this first version.
    const isEmployeeCountQuestion =
      text.includes("how many") &&
      (text.includes("employee") || text.includes("employees"));

    if (!isEmployeeCountQuestion) {
      return res.json({
        answer:
          "For now, I can answer questions about the number of employees. More company-data questions will be added step by step.",
      });
    }

    // Employees can only ask about their own profile.
    if (role === "employee") {
      const employee = await Employee.findOne({ userId })
        .select("_id status");

      return res.json({
        answer: employee
          ? "Your employee profile is registered in the system."
          : "Your employee profile was not found.",
      });
    }

    let employeeFilter = {};

    // Managers can only see employees in departments they manage.
    if (role === "manager") {
      const managedDepartments = await Department.find({
        manager: userId,
      }).select("_id");

      const departmentIds = managedDepartments.map(
        (department) => department._id
      );

      employeeFilter.department = { $in: departmentIds };
    } else if (role !== "admin") {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const totalEmployees = await Employee.countDocuments(
      employeeFilter
    );

    return res.json({
      answer: `There are ${totalEmployees} employee profile(s) within your permitted data access.`,
    });
  } catch (error) {
    console.error("Company data error:", error.message);

    return res.status(500).json({
      message: "Unable to answer the company-data question.",
    });
  }
});

module.exports = router;
