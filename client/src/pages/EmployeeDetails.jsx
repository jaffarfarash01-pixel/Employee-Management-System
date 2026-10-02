import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeaves] = useState([]);

  const fetchEmployee = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setEmployee(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (loading) {
    return <p>Loading employee...</p>;
  }

  if (!employee) {
    return <p>Employee not found.</p>;
  }

  const handleDelete = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this employee?"
  );

  if (!confirmDelete) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/employees/${id}`,
      {
        method: "DELETE",
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

    alert("Employee deleted successfully");

    navigate("/employees");
  } catch (error) {
    console.error(error);
    alert("Server connection failed");
  }
};

  return (
    <div>
      <button onClick={() => navigate("/employees")}>
        ← Back to Employees
      </button>

      <h1>Employee Details</h1>

      <div>
        <p>
          <strong>Employee ID:</strong> {employee.employeeId}
        </p>

        <p>
          <strong>Name:</strong> {employee.userId?.name}
        </p>

        <p>
          <strong>Email:</strong> {employee.userId?.email}
        </p>

        <p>
          <strong>Role:</strong> {employee.userId?.role}
        </p>

        <p>
          <strong>Phone:</strong> {employee.phone}
        </p>

        <p>
          <strong>Department:</strong> {employee.department?.name}
        </p>

        <p>
          <strong>Position:</strong> {employee.position}
        </p>

        <p>
          <strong>Joining Date:</strong>{" "}
          {new Date(employee.joiningDate).toLocaleDateString()}
        </p>

        <p>
          <strong>Status:</strong> {employee.status}
        </p>

        <button onClick={() => navigate(`/employees/${id}/edit`)}>
          Edit Employee
        </button>

        <button onClick={handleDelete}>Delete Employee</button>
      </div>
    </div>
  );
}

export default EmployeeDetails;
