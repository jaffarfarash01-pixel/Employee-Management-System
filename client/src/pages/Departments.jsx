import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Users,
  UserRound,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
  });
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    manager: "",
  });
  const navigate = useNavigate();

  const fetchManagers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      const managerUsers = data.filter((user) => user.role === "manager");

      setManagers(managerUsers);
    } catch (error) {
      console.error(error);
    }
  };

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setDepartments(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    if (role === "admin") {
      fetchManagers();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  if (loading) {
    return <p>Loading departments...</p>;
  }



    if (!formData.name.trim()) {
      alert("Department name is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create department");
        return;
      }

      alert("Department created successfully");

      setFormData({
        name: "",
        description: "",
        manager: "",
      });

      setShowForm(false);

      fetchDepartments();
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  //  EDIT HANDLER
  const handleEditClick = (department) => {
    setEditingDepartment(department);

    setEditFormData({
      name: department.name || "",
      description: department.description || "",
      manager: department.manager?._id || "",
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/departments/${editingDepartment._id}`,
        {
          method: "PUT",
          headers: {
            "content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update department");
        return;
      }
      alert("Department updated successfully");

      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error(error);
      alert("server connection failed");
    }
  };

  // DELETE HANDLER
  const handleDelete = async (departmentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/departments/${departmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete department");
        return;
      }
      alert("Department deleted successfully");

      fetchDepartments();
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Departments</h1>
          <p>Manage your organization's departments and managers.</p>
        </div>

        {role === "admin" && (
          <button
            className="department-add-btn"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Department
          </button>
        )}
      </div>

      {showForm && (
        <div className="department-form-overlay">
          <div className="department-form-card">
            <div className="department-form-header">
              <div>
                <h2>Add Department</h2>
                <p>Create a new organization department</p>
              </div>

              <button
                className="department-close-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Development"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter department description"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Assign Manager</label>

                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                >
                  <option value="">Select Manager</option>

                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} - {manager.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="department-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="department-save-btn">
                  <Plus size={17} />
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Building2 size={22} />
          </div>

          <div>
            <h3>Total Departments</h3>
            <p>{departments.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserRound size={22} />
          </div>

          <div>
            <h3>Assigned Managers</h3>
            <p>
              {departments.filter((department) => department.manager).length}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <h3>Active Departments</h3>
            <p>
              {
                departments.filter(
                  (department) => department.status === "active",
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>All Departments</h2>
            <p>Departments available in the organization</p>
          </div>
        </div>

        {departments.length === 0 ? (
          <p className="empty-message">No departments found.</p>
        ) : (
          <div className="department-grid">
            {departments.map((department) => (
              <div
                className="department-card"
                key={department._id}
                onClick={() => navigate(`/departments/${department._id}`)}
              >
                {role === "admin" && (
                  <div className="department-actions">
                    <button
                      className="department-edit-btn"
                      onClick={() => handleEditClick(department)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      className="department-delete-btn"
                      onClick={() => handleDelete(department._id)}
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}
                <div className="department-card-top">
                  <div className="department-icon">
                    <Building2 size={22} />
                  </div>

                  <span
                    className={`attendance-status status-${
                      department.status || "active"
                    }`}
                  >
                    {department.status || "active"}
                  </span>
                </div>

                <h3>{department.name}</h3>

                <p>{department.description || "No description available."}</p>

                <div className="department-manager">
                  <UserRound size={16} />

                  <span>
                    {department.manager?.name || "No manager assigned"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {editingDepartment && (
        <div className="department-form-overlay">
          <div className="department-form-card">
            <div className="department-form-header">
              <div>
                <h2>Edit Department</h2>
                <p>Update department information</p>
              </div>

              <button
                className="department-close-btn"
                onClick={() => setEditingDepartment(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Department Name</label>

                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Assign Manager</label>

                <select
                  name="manager"
                  value={editFormData.manager}
                  onChange={handleEditChange}
                >
                  <option value="">No Manager</option>

                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} - {manager.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="department-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingDepartment(null)}
                >
                  Cancel
                </button>

                <button type="submit" className="department-save-btn">
                  <Pencil size={16} />
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
