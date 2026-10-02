const Project = require("../models/Project");
const Department = require("../models/Department");

const projectOwner = async (req, res, next) => {
  try {
    // Admin can access every project
    if (req.user.role === "admin") {
      return next();
    }

    // Find the project
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Find the project's department
    const department = await Department.findById(project.department);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    // Check if logged-in manager owns this department
    if (department.manager.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only manage projects in your department",
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = projectOwner;