import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function AddEmployee({ onEmployeeAdded }) {

  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    phone: "",
    department: "",
    position: "",
    joiningDate: "",
  });

const fetchDepartments = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      "http://localhost:5000/api/departments",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    // Manager → show only their department
    if (user.role === "manager") {
      const myDepartments = data.filter(
        (department) =>
          department.manager &&
          department.manager._id === user.id
      );

      setDepartments(myDepartments);
    } else {
      // Admin → show all departments
      setDepartments(data);
    }
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.employeeId ||
      !formData.phone ||
      !formData.department ||
      !formData.position ||
      !formData.joiningDate
    ) {
      alert("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/employees",
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
        alert(data.error || data.message);
        return;
      }

      alert("Employee created successfully");
      navigate("/employees");

      if (onEmployeeAdded) {
        onEmployeeAdded();
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        employeeId: "",
        phone: "",
        department: "",
        position: "",
        joiningDate: "",
      });
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Add Employee</h1>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label>Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Employee name"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="employee@gmail.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </div>

        {/* Employee ID */}
        <div>
          <label>Employee ID</label>

          <input
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            placeholder="EMP005"
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
            placeholder="9876543210"
            required
          />
        </div>

        {/* Department */}
        <div>
          <label>Select Department</label>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Department
            </option>

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

        {/* Position */}
        <div>
          <label>Position</label>

          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Frontend Developer"
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

        <button type="submit">
          Add Employee
        </button>
      </form>
    </div>
  );
}

export default AddEmployee;
