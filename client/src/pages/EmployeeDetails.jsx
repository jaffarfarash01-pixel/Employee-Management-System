import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch employee, attendance and leaves
  const fetchEmployee = async () => {
    const token = localStorage.getItem("token");

    try {
      const [employeeResponse, attendanceResponse, leaveResponse] =
        await Promise.all([
          // Employee
          fetch(`http://localhost:5000/api/employees/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          // Attendance
          fetch("http://localhost:5000/api/attendance", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          // Leaves
          fetch("http://localhost:5000/api/leaves", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const employeeData = await employeeResponse.json();
      const attendanceData = await attendanceResponse.json();
      const leaveData = await leaveResponse.json();

      // Check employee response
      if (!employeeResponse.ok) {
        alert(employeeData.message);
        return;
      }

      setEmployee(employeeData);

      // Attendance uses USER ID
      if (attendanceResponse.ok) {
        const employeeAttendance = attendanceData.filter(
          (record) =>
            record.employee?._id === employeeData.userId?._id,
        );

        setAttendance(employeeAttendance);
      } else {
        console.error(attendanceData.message);
      }

      // Leave also uses USER ID
      if (leaveResponse.ok) {
        const employeeLeaves = leaveData.filter(
          (leave) =>
            leave.employee?._id === employeeData.userId?._id,
        );

        setLeaves(employeeLeaves);
      } else {
        console.error(leaveData.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // Load data
  useEffect(() => {
    fetchEmployee();
  }, [id]);

  // Delete employee
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?",
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
        },
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

  // Loading
  if (loading) {
    return <p>Loading employee...</p>;
  }

  // Employee not found
  if (!employee) {
    return <p>Employee not found.</p>;
  }

  // =========================
  // Attendance Summary
  // =========================

  const presentCount = attendance.filter(
    (record) => record.status === "present",
  ).length;

  const lateCount = attendance.filter(
    (record) => record.status === "late",
  ).length;

  const absentCount = attendance.filter(
    (record) => record.status === "absent",
  ).length;

  // =========================
  // Leave Summary
  // =========================

  const approvedLeaves = leaves.filter(
    (leave) => leave.approvalStatus === "approved",
  ).length;

  const pendingLeaves = leaves.filter(
    (leave) => leave.approvalStatus === "pending",
  ).length;

  const rejectedLeaves = leaves.filter(
    (leave) => leave.approvalStatus === "rejected",
  ).length;

  return (
    <div className="admin-dashboard employee-details-page">

      {/* =========================
          Header
      ========================= */}

      <div className="employee-details-header">
        <button onClick={() => navigate("/employees")}>
          ← Back to Employees
        </button>

        <h1>Employee Details</h1>
      </div>

      {/* =========================
          Employee Information
      ========================= */}

      <div className="employee-info-grid">

        {/* Personal Information */}
        <div className="employee-info-card">
          <h2>Personal Information</h2>

          <p>
            <strong>Employee ID:</strong>{" "}
            {employee.employeeId}
          </p>

          <p>
            <strong>Name:</strong>{" "}
            {employee.userId?.name || "-"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {employee.userId?.email || "-"}
          </p>

          <p>
            <strong>Role:</strong>{" "}
            {employee.userId?.role || "-"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {employee.phone || "-"}
          </p>
        </div>

        {/* Job Information */}
        <div className="employee-info-card">
          <h2>Job Information</h2>

          <p>
            <strong>Department:</strong>{" "}
            {employee.department?.name || "Not assigned"}
          </p>

          <p>
            <strong>Position:</strong>{" "}
            {employee.position || "-"}
          </p>

          <p>
            <strong>Joining Date:</strong>{" "}
            {employee.joiningDate
              ? new Date(
                  employee.joiningDate,
                ).toLocaleDateString()
              : "-"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {employee.status || "-"}
          </p>
        </div>
      </div>

      {/* =========================
          Summary Cards
      ========================= */}

      <div className="employee-info-grid">

        {/* Attendance Summary */}
        <div className="employee-info-card">
          <h2>Attendance Summary</h2>

          <p>
            <strong>Total Records:</strong>{" "}
            {attendance.length}
          </p>

          <p>
            <strong>Present:</strong>{" "}
            {presentCount}
          </p>

          <p>
            <strong>Late:</strong>{" "}
            {lateCount}
          </p>

          <p>
            <strong>Absent:</strong>{" "}
            {absentCount}
          </p>
        </div>

        {/* Leave Summary */}
        <div className="employee-info-card">
          <h2>Leave Summary</h2>

          <p>
            <strong>Total Requests:</strong>{" "}
            {leaves.length}
          </p>

          <p>
            <strong>Approved:</strong>{" "}
            {approvedLeaves}
          </p>

          <p>
            <strong>Pending:</strong>{" "}
            {pendingLeaves}
          </p>

          <p>
            <strong>Rejected:</strong>{" "}
            {rejectedLeaves}
          </p>
        </div>
      </div>

      {/* =========================
          Recent Attendance
      ========================= */}

      <div className="employee-info-card">
        <h2>Recent Attendance</h2>

        {attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Working Hours</th>
              </tr>
            </thead>

            <tbody>
              {attendance.slice(0, 5).map((record) => (
                <tr key={record._id}>
                  <td>
                    {record.date
                      ? new Date(
                          record.date,
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {record.checkIn
                      ? new Date(
                          record.checkIn,
                        ).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td>
                    {record.checkOut
                      ? new Date(
                          record.checkOut,
                        ).toLocaleTimeString()
                      : "-"}
                  </td>

                  <td>{record.status}</td>

                  <td>
                    {record.workingHours ?? 0} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================
          Recent Leaves
      ========================= */}

      <div className="employee-info-card">
        <h2>Recent Leaves</h2>

        {leaves.length === 0 ? (
          <p>No leave requests found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {leaves.slice(0, 5).map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.leaveType}</td>

                  <td>
                    {new Date(
                      leave.startDate,
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {new Date(
                      leave.endDate,
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {leave.duration} days
                  </td>

                  <td>
                    {leave.approvalStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================
          Actions
      ========================= */}

      <div className="employee-details-actions">
        <button
          onClick={() =>
            navigate(`/employees/${id}/edit`)
          }
        >
          Edit Employee
        </button>

        <button onClick={handleDelete}>
          Delete Employee
        </button>
      </div>
    </div>
  );
}

export default EmployeeDetails;