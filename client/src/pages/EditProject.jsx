import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    manager: "",
    startDate: "",
    endDate: "",
    status: "planning",
  });

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [projectResponse, departmentResponse, managerResponse] =
        await Promise.all([
          fetch(`http://localhost:5000/api/projects/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

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

      const projectData = await projectResponse.json();
      const departmentData = await departmentResponse.json();
      const managerData = await managerResponse.json();

      if (!projectResponse.ok) {
        alert(projectData.message || "Failed to load project");
        return;
      }

      if (!departmentResponse.ok) {
        alert(departmentData.message || "Failed to load departments");
        return;
      }

      if (!managerResponse.ok) {
        alert(managerData.message || "Failed to load managers");
        return;
      }

      setFormData({
        name: projectData.name || "",
        description: projectData.description || "",
        department: projectData.department?._id || "",
        manager: projectData.manager?._id || "",
        startDate: projectData.startDate
          ? projectData.startDate.split("T")[0]
          : "",
        endDate: projectData.endDate
          ? projectData.endDate.split("T")[0]
          : "",
        status: projectData.status || "planning",
      });

      setDepartments(departmentData);
      setManagers(managerData);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update project");
        return;
      }

      alert("Project updated successfully");

      navigate(`/projects/${id}`);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  if (loading) {
    return <p>Loading project...</p>;
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Edit Project</h1>
          <p>Update project information</p>
        </div>

        <button onClick={() => navigate(`/projects/${id}`)}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div>
          <label>Project Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Department</label>

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

        <div>
          <label>Manager</label>

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

        <div>
          <label>Start Date</label>

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>End Date</label>

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        <div>
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

        <button type="submit">
          Update Project
        </button>
      </form>
    </div>
  );
}

export default EditProject;