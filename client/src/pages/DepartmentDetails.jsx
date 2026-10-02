import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, UserRound, Users } from "lucide-react";

function DepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [departmentResponse, employeesResponse] =
        await Promise.all([
          fetch(`http://localhost:5000/api/departments/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/employees", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const departmentData = await departmentResponse.json();
      const employeesData = await employeesResponse.json();

      if (!departmentResponse.ok) {
        alert(departmentData.message);
        return;
      }

      if (!employeesResponse.ok) {
        alert(employeesData.message);
        return;
      }

      setDepartment(departmentData);

      const departmentEmployees = employeesData.filter(
        (employee) =>
          employee.department?._id === id
      );

      setEmployees(departmentEmployees);
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

  if (loading) {
    return <p>Loading department...</p>;
  }

  if (!department) {
    return <p>Department not found.</p>;
  }

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate("/departments")}
          >
            <ArrowLeft size={18} />
            Back to Departments
          </button>

          <h1>{department.name}</h1>

          <p>
            {department.description ||
              "No department description available."}
          </p>
        </div>
      </div>

      {/* Department Information */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            <Building2 size={22} />
          </div>

          <div>
            <h3>Department</h3>
            <p>{department.name}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <UserRound size={22} />
          </div>

          <div>
            <h3>Manager</h3>
            <p>
              {department.manager?.name ||
                "No manager assigned"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={22} />
          </div>

          <div>
            <h3>Employees</h3>
            <p>{employees.length}</p>
          </div>
        </div>

      </div>

      {/* Employees */}
      <div className="dashboard-section">

        <div className="section-header">
          <div>
            <h2>Department Employees</h2>
            <p>
              Employees working in {department.name}
            </p>
          </div>
        </div>

        {employees.length === 0 ? (
          <p className="empty-message">
            No employees assigned to this department.
          </p>
        ) : (
          <div className="department-employees-grid">

            {employees.map((employee) => (
              <div
                className="department-employee-card"
                key={employee._id}
              >
                <div className="employee-card-icon">
                  <UserRound size={22} />
                </div>

                <div className="employee-card-info">
                  <h3>
                    {employee.userId?.name ||
                      "Unknown Employee"}
                  </h3>

                  <p>
                    {employee.position ||
                      "No position"}
                  </p>

                  <span>
                    {employee.employeeId}
                  </span>
                </div>

                <button
                  onClick={() =>
                    navigate(`/employees/${employee._id}`)
                  }
                >
                  View
                </button>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default DepartmentDetails;