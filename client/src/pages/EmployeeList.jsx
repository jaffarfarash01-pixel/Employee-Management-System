
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/employees",
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

      setEmployees(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  if (loading) {
    return <p>Loading employees...</p>;
  }

  return (
    <div>
      <h1>Employee List</h1>

      <button onClick={() => navigate("/employees/add")}>
        Add Employee
      </button>

      {employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Position</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.employeeId}</td>

                <td>{employee.userId?.name}</td>

                <td>{employee.userId?.email}</td>

                <td>{employee.phone}</td>

                <td>{employee.position}</td>

                <td>
                  {new Date(
                    employee.joiningDate
                  ).toLocaleDateString()}
                </td>

                <td>{employee.status}</td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/employees/${employee._id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeList;