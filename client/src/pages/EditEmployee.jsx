import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: "",
    phone: "",
    department: "",
    position: "",
    joiningDate: "",
    status: "",
  });

  // Fetch employee and departments
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [employeeResponse, departmentResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:5000/api/departments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const employeeData = await employeeResponse.json();
      const departmentData = await departmentResponse.json();

      if (!employeeResponse.ok) {
        alert(employeeData.message);
        return;
      }

      if (!departmentResponse.ok) {
        alert(departmentData.message);
        return;
      }

      setFormData({
        employeeId: employeeData.employeeId,
        phone: employeeData.phone,
        department: employeeData.department?._id || "",
        position: employeeData.position,
        joiningDate: employeeData.joiningDate
          ? employeeData.joiningDate.split("T")[0]
          : "",
        status: employeeData.status,
      });

      setDepartments(departmentData);
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

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || data.error);
        return;
      }

      alert("Employee updated successfully");

      navigate(`/employees/${id}`);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  if (loading) {
    return <p>Loading employee...</p>;
  }

  return (
    <div>
      <button onClick={() => navigate(`/employees/${id}`)}>← Back</button>

      <h1>Edit Employee</h1>

      <form onSubmit={handleSubmit}>
        {/* Employee ID */}
        <div>
          <label>Employee ID</label>

          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label>Phone</label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {/* Department */}
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
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div>
          <label>Position</label>

          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </div>

        {/* Joining Date */}
        <div>
          <label>Joining Date</label>

          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Status */}
        <div>
          <label>Status</label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit">Update Employee</button>
      </form>
    </div>
  );
}

export default EditEmployee;
