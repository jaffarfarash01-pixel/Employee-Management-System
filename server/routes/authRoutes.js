const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middleware/authMiddlware");
const Employee = require("../models/Employee");
const crypto = require("crypto");
const EmployeeInvitation = require("../models/EmployeeInvitation");
const Department = require("../models/Department");

const router = express.Router();

router.post("/register", protect , authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user exist or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    //  hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "server Error",
      error: error.message,
    });
  }
});

// CREATE EMPLOYEE
router.post(
  "/employees",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    let createdUser = null;

    try {
      const {
        name,
        email,
        employeeId,
        phone,
        department,
        position,
        joiningDate,
        status,
      } = req.body;

      // Check required fields
      if (
        !name ||
        !email ||
        !employeeId ||
        !phone ||
        !department ||
        !position ||
        !joiningDate
      ) {
        return res.status(400).json({
          message: "Please fill all required employee fields",
        });
      }

      // Check whether email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      // Managers can add employees only to their own department
      if (req.user.role === "manager") {
        const Department = require("../models/Department");
        const selectedDepartment =
          await Department.findById(department);

        if (!selectedDepartment) {
          return res.status(404).json({
            message: "Department not found",
          });
        }

        if (
          !selectedDepartment.manager ||
          selectedDepartment.manager.toString() !== req.user.userId
        ) {
          return res.status(403).json({
            message:
              "You can only add employees to your own department",
          });
        }
      }

      // Generate a random temporary password
      // The employee must receive a secure password-setup invitation
      const temporaryPassword = require("crypto")
        .randomBytes(32)
        .toString("hex");

      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        12
      );

      // Create employee login account
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "employee",
      });

      createdUser = user;

      // Create employee profile
      const employee = await Employee.create({
        userId: user._id,
        employeeId,
        phone,
        department,
        position,
        joiningDate,
        status: status || "active",
      });

      return res.status(201).json({
        message:
          "Employee created successfully. Password setup invitation is not configured yet.",
        employee,
      });
    } catch (error) {
      // Avoid leaving an orphan login account if profile creation fails
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id).catch(() => {});
      }

      console.error("Create employee error:", error.message);

      return res.status(500).json({
        message: "Unable to create employee",
      });
    }
  }
);


/* CREATE EMPLOYEE INVITATION */
router.post(
  "/employees/:employeeId/invitation",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      const employee = await Employee.findById(
        req.params.employeeId
      ).populate("userId", "email role");

      if (!employee || !employee.userId) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      // Only employee accounts can receive invitations
      if (employee.userId.role !== "employee") {
        return res.status(400).json({
          message: "This account is not an employee account",
        });
      }

      // Managers can invite only employees in their department
      if (req.user.role === "manager") {
        const department = await Department.findById(
          employee.department
        );

        if (
          !department ||
          !department.manager ||
          department.manager.toString() !== req.user.userId
        ) {
          return res.status(403).json({
            message: "You can invite employees only in your department",
          });
        }
      }

      // Invalidate previous unused invitations for this email
      await EmployeeInvitation.deleteMany({
        email: employee.userId.email,
        usedAt: null,
      });

      // Generate a secure token; store only its SHA-256 hash
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await EmployeeInvitation.create({
        email: employee.userId.email,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: req.user.userId,
      });

      // Return token temporarily for development/testing only.
      // Do not expose this in production; send it through email instead.
      return res.status(201).json({
        message: "Invitation created. It expires in 24 hours.",
        invitationToken: token,
      });
    } catch (error) {
      console.error("Invitation creation error:", error.message);

      return res.status(500).json({
        message: "Unable to create invitation",
      });
    }
  }
);


/* COMPLETE EMPLOYEE REGISTRATION */
router.post("/employees/complete-registration", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "Provide a valid invitation and a password of 8–128 characters.",
      });
    }

    // Hash the supplied invitation token before searching
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const invitation = await EmployeeInvitation.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return res.status(400).json({
        message: "Invitation is invalid, expired, or already used.",
      });
    }

    const user = await User.findOne({
      email: invitation.email,
      role: "employee",
    });

    if (!user) {
      return res.status(404).json({
        message: "Employee account not found.",
      });
    }

    // Save the employee's chosen password
    user.password = await bcrypt.hash(password, 12);
    await user.save();

    // Mark the invitation as used
    invitation.usedAt = new Date();
    await invitation.save();

    return res.json({
      message: "Password set successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Registration completion error:", error.message);

    return res.status(500).json({
      message: "Unable to complete registration.",
    });
  }
});


// UPDATE USER

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    // create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});

// GET ONE USER
router.get("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET ALL USERS
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET ALL MANAGERS
router.get("/managers", protect, authorize("admin"), async (req, res) => {
  try {
    const managers = await User.find({
        role:"manager",
    }).select("-password");

    res.json(managers);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET ALL EMPLOYEES
router.get("/employees", protect, authorize("admin"), async (req, res) => {
  try {
    const employees = await User.find({
        role:"employee",
    }).select("-password");

    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// DELETE USER
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent admin from deleting their own account
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    // Delete employee profile if it exists
    await Employee.findOneAndDelete({
      userId: user._id,
    });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
