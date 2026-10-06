import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function EmployeeList() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/employees",
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

  // =========================
  // Filter Employees
  // =========================

  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      employee.employeeId
        ?.toLowerCase()
        .includes(searchText) ||
      employee.userId?.name
        ?.toLowerCase()
        .includes(searchText) ||
      employee.userId?.email
        ?.toLowerCase()
        .includes(searchText) ||
      employee.position
        ?.toLowerCase()
        .includes(searchText);

    const matchesDepartment =
      !departmentFilter ||
      employee.department?._id === departmentFilter;

    const matchesStatus =
      !statusFilter ||
      employee.status === statusFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );
  });

  // Get unique departments
  const departments = employees
    .filter((employee) => employee.department)
    .reduce((unique, employee) => {
      if (
        !unique.some(
          (department) =>
            department._id === employee.department._id,
        )
      ) {
        unique.push(employee.department);
      }

      return unique;
    }, []);

  if (loading) {
    return <p>Loading employees...</p>;
  }

  return (
    <div className="admin-dashboard employee-list-page">

      {/* =========================
          Header
      ========================= */}

      <div className="page-header">
        <div>
          <h1>Employees</h1>

          <p>
            Manage your organization's employees
          </p>
        </div>

        <button
          onClick={() => navigate("/employees/add")}
        >
          + Add Employee
        </button>
      </div>

      {/* =========================
          Filters
      ========================= */}

      <div className="employee-filters">

        {/* Search */}

        <input
          type="text"
          placeholder="Search by name, email, ID or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Department */}

        <select
          value={departmentFilter}
          onChange={(e) =>
            setDepartmentFilter(e.target.value)
          }
        >
          <option value="">
            All Departments
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

        {/* Status */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        {/* Clear */}

        {(search ||
          departmentFilter ||
          statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setDepartmentFilter("");
              setStatusFilter("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* =========================
          Result Count
      ========================= */}

      <p className="employee-result-count">
        Showing {filteredEmployees.length} of{" "}
        {employees.length} employees
      </p>

      {/* =========================
          Employee Table
      ========================= */}

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <h3>No employees found</h3>

          <p>
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="employee-table-card">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id}>

                  <td>
                    {employee.employeeId}
                  </td>

                  <td>
                    {employee.userId?.name || "-"}
                  </td>

                  <td>
                    {employee.userId?.email || "-"}
                  </td>

                  <td>
                    {employee.department?.name ||
                      "Not assigned"}
                  </td>

                  <td>
                    {employee.position || "-"}
                  </td>

                  <td>
                    <span
                      className={`employee-status ${employee.status}`}
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        navigate(
                          `/employees/${employee._id}`,
                        )
                      }
                    >
                      View
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;