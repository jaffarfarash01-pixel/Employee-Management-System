const express = require("express");
const Announcement = require("../models/Announcement");
const Department = require("../models/Department"); 
const { protect, authorize } = require("../middleware/authMiddlware");

const router = express.Router();

// CREATE ANNOUNCEMENT
router.post("/",protect,authorize("admin","manager"), async (req , res) => {
    try{
        const { title, message, audience, department, expiresAt, } = req.body;

      // Manager can only announce to their own department
      if (req.user.role === "manager") {
        if (audience === "department") {
          const selectedDepartment =
            await Department.findById(department);

          if (!selectedDepartment) {
            return res.status(404).json({
              message: "Department not found",
            });
          }

          if (
            selectedDepartment.manager.toString() !==
            req.user.userId
          ) {
            return res.status(403).json({
              message:
                "You can only announce to your own department",
            });
          }
        }

        // Manager cannot announce to all employees
        if (audience === "all") {
          return res.status(403).json({
            message:
              "Manager can only announce to their own department",
          });
        }
      }

      const announcement = await Announcement.create({
        title,
        message,
        createdBy: req.user.userId,
        audience,
        department:
          audience === "department" ? department : undefined,
        expiresAt,
      });

      res.status(201).json({
        message: "Announcement created successfully",
        announcement,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }

});

// GET ANNOUNCEMENTS
router.get("/", protect, async (req, res) => {
  try {
    let announcements;

    // ADMIN → see all announcements
    if (req.user.role === "admin") {
      announcements = await Announcement.find()
        .populate("createdBy", "name email role")
        .populate("department", "name")
        .sort({ createdAt: -1 });
    }

    // MANAGER → see announcements relevant to their department
    else if (req.user.role === "manager") {
      const departments = await Department.find({
        manager: req.user.userId,
      });

      const departmentIds = departments.map(
        (department) => department._id
      );

      announcements = await Announcement.find({
        $and: [
          {
            $or: [
              { audience: "all" },
              {
                audience: "department",
                department: { $in: departmentIds },
              },
            ],
          },
          {
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: null },
              { expiresAt: { $gte: new Date() } },
            ],
          },
        ],
      })
        .populate("createdBy", "name email role")
        .populate("department", "name")
        .sort({ createdAt: -1 });
    }

    // EMPLOYEE → see all + own department announcements
    else if (req.user.role === "employee") {
      const Employee = require("../models/Employee");

      const employee = await Employee.findOne({
        userId: req.user.userId,
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee profile not found",
        });
      }

      announcements = await Announcement.find({
        $and: [
          {
            $or: [
              { audience: "all" },
              {
                audience: "department",
                department: employee.department,
              },
            ],
          },
          {
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: null },
              { expiresAt: { $gte: new Date() } },
            ],
          },
        ],
      })
        .populate("createdBy", "name email role")
        .populate("department", "name")
        .sort({ createdAt: -1 });
    }

    res.json(announcements);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});
module.exports = router;

