
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../components/style/AddEmployee.css";

function AddEmployee({ onEmployeeAdded, onClose }) {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

      if (user?.role === "manager") {
        const myDepartments = data.filter(
          (department) =>
            department.manager &&
            department.manager._id === user.id
        );

        setDepartments(myDepartments);
      } else {
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/employees");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
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

      if (onEmployeeAdded) {
        onEmployeeAdded();
      }

      setFormData({
        name: "",
        email: "",
        employeeId: "",
        phone: "",
        department: "",
        position: "",
        joiningDate: "",
      });

      if (onClose) {
        onClose();
      } else {
        navigate("/employees");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  return (
    <div className="employee-modal-overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) handleClose();
    }}>
      <div
        className="employee-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-employee-title"
      >
        <div className="employee-modal-header">
          <div>
            <h2 id="add-employee-title">Add Employee</h2>
            <p>Create a new employee profile</p>
          </div>

          <button
            type="button"
            className="employee-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="employee-modal-loading">
            Loading departments...
          </p>
        ) : (
          <form className="employee-modal-form" onSubmit={handleSubmit}>
            <div className="employee-form-grid">
              <div className="employee-form-field">
                <label htmlFor="employee-name">Full name</label>
                <input
                  id="employee-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Employee name"
                  required
                />
              </div>

              <div className="employee-form-field">
                <label htmlFor="employee-id">Employee ID</label>
                <input
                  id="employee-id"
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP005"
                  required
                />
              </div>

              <div className="employee-form-field">
                <label htmlFor="employee-email">Email address</label>
                <input
                  id="employee-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@gmail.com"
                  required
                />
              </div>

              <div className="employee-form-field">
                <label htmlFor="employee-phone">Phone number</label>
                <input
                  id="employee-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                />
              </div>


              <div className="employee-form-field">
                <label htmlFor="employee-department">Department</label>
                <select
                  id="employee-department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-form-field">
                <label htmlFor="employee-position">Position</label>
                <input
                  id="employee-position"
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Frontend Developer"
                  required
                />
              </div>

              <div className="employee-form-field">
                <label htmlFor="employee-joining-date">Joining date</label>
                <input
                  id="employee-joining-date"
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="employee-modal-actions">
              <button
                type="button"
                className="employee-cancel-button"
                onClick={handleClose}
              >
                Cancel
              </button>

              <button type="submit" className="employee-submit-button">
                Add Employee
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddEmployee;
