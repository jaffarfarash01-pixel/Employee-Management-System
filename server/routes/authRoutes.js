const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middleware/authMiddlware");
const Employee = require("../models/Employee");

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
    try {
      const {
        name,
        email,
        password,
        employeeId,
        phone,
        department,
        position,
        joiningDate,
        status,
      } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      // Manager can only add employee to their own department
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

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create User account
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "employee",
      });

      // Create Employee profile
      const employee = await Employee.create({
        userId: user._id,
        employeeId,
        phone,
        department,
        position,
        joiningDate,
        status: status || "active",
      });

      res.status(201).json({
        message: "Employee created successfully",
        employee,
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);


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
