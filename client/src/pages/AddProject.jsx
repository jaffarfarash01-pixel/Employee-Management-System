import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AddProject() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    manager: "",
    startDate: "",
    endDate: "",
    status: "planning",
  });

  const role = localStorage.getItem("role");

  // Get departments and managers
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [departmentsResponse, usersResponse] = await Promise.all([
        fetch("http://localhost:5000/api/departments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:5000/api/auth/managers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const departmentsData = await departmentsResponse.json();
      const usersData = await usersResponse.json();
    //   console.log("Users from API:", usersData);

      if (!departmentsResponse.ok) {
        alert(departmentsData.message);
        return;
      }

      if (!usersResponse.ok) {
        alert(usersData.message);
        return;
      }

      setDepartments(departmentsData);

      // Only managers should appear in manager dropdown
    //   const managerUsers = usersData.filter(
    //     (user) => user.role === "manager"
    //   );

      setManagers(usersData);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
  const { name, value } = e.target;

  // When department changes,
  // automatically select its manager
  if (name === "department") {
    const selectedDepartment = departments.find(
      (department) => department._id === value
    );

    setFormData({
      ...formData,
      department: value,
      manager: selectedDepartment?.manager?._id || "",
    });

    return;
  }

  setFormData({
    ...formData,
    [name]: value,
  });
};
  // Create project
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.department ||
      !formData.manager ||
      !formData.startDate
    ) {
      alert("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error);
        return;
      }

      alert("Project created successfully");

      navigate("/projects");
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="admin-dashboard project-form-page">
      <div className="page-header">
        <div>
          <h1>Add Project</h1>
          <p>Create a new project for your organization</p>
        </div>
      </div>

      <div className="project-form-card">
        <form onSubmit={handleSubmit}>
          {/* Project Name */}
          <div className="form-group">
            <label>Project Name *</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Website Development"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows="4"
            />
          </div>

          {/* Department */}
          <div className="form-group">
            <label>Department *</label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>

              {departments.map((department) => (
                <option
                  key={department._id}
                  value={department._id}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div className="form-group">
            <label>Project Manager *</label>

            <select
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              required
            >
              <option value="">Select Manager</option>

              {managers.map((manager) => (
                <option
                  key={manager._id}
                  value={manager._id}
                >
                  {manager.name} - {manager.email}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Status */}
          <div className="form-group">
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              disabled={submitting}
            >
              Cancel
            </button>

            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProject;