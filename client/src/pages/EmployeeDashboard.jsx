import { useEffect, useState } from "react";
import {
  Clock3,
  LogIn,
  LogOut,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

function EmployeeDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tasks, setTasks] = useState([]);

  const token = localStorage.getItem("token");
  const employeeName = localStorage.getItem("name") || "Employee";

  const fetchDashboardData = async () => {
    try {
      const [attendanceResponse, leavesResponse, tasksResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/attendance/my", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/leaves/my", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/tasks", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

      const attendanceData = await attendanceResponse.json();
      const leavesData = await leavesResponse.json();
      const tasksData = await tasksResponse.json();

      if (attendanceResponse.ok) {
        setAttendance(attendanceData);
      }

      if (leavesResponse.ok) {
        setLeaves(leavesData);
      }

      if (tasksResponse.ok) {
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get today's attendance
  const today = new Date();

  const todayRecord = attendance.find((record) => {
    const recordDate = new Date(record.date);

    return (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    );
  });

  // Check In
  const handleCheckIn = async () => {
    setActionLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/attendance/check-in",
        {
          method: "POST",
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

      alert("Check-in successful");
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Check Out
  const handleCheckOut = async () => {
    setActionLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/attendance/check-out",
        {
          method: "POST",
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

      alert("Check-out successful");
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setActionLoading(false);
    }
  };

// Task counts
const totalTasks = tasks.length;

const pendingTasks = tasks.filter(
  (task) => task.status === "todo"
).length;

const inProgressTasks = tasks.filter(
  (task) => task.status === "in-progress"
).length;

const completedTasks = tasks.filter(
  (task) => task.status === "completed"
).length;


  // Leave counts
  const pendingLeaves = leaves.filter(
    (leave) => leave.approvalStatus === "pending",
  ).length;

  const approvedLeaves = leaves.filter(
    (leave) => leave.approvalStatus === "approved",
  ).length;

  const recentLeaves = leaves.slice(0, 5);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {employeeName}</h1>
          <p>Here's your attendance and leave overview for today.</p>
        </div>

        <div className="dashboard-date">
          {today.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <h3>Today Status</h3>

            <p>{todayRecord ? todayRecord.status : "Not Marked"}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h3>Approved Leaves</h3>
            <p>{approvedLeaves}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <h3>Pending Leaves</h3>
            <p>{pendingLeaves}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <h3>Working Hours</h3>

            <p>
              {todayRecord?.workingHours
                ? `${todayRecord.workingHours} hrs`
                : "0 hrs"}
            </p>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
<div className="dashboard-section">
  <div className="section-header">
    <div>
      <h2>My Tasks</h2>
      <p>Overview of your assigned tasks</p>
    </div>
  </div>

  <div className="stats-grid">
    <div className="stat-card">
      <div className="stat-icon">
        <CheckCircle2 size={22} />
      </div>
      <div>
        <h3>Total Tasks</h3>
        <p>{totalTasks}</p>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon">
        <Clock3 size={22} />
      </div>
      <div>
        <h3>To Do</h3>
        <p>{pendingTasks}</p>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon">
        <Clock3 size={22} />
      </div>
      <div>
        <h3>In Progress</h3>
        <p>{inProgressTasks}</p>
      </div>
    </div>

    <div className="stat-card">
      <div className="stat-icon">
        <CheckCircle2 size={22} />
      </div>
      <div>
        <h3>Completed</h3>
        <p>{completedTasks}</p>
      </div>
    </div>
  </div>
</div>

      {/* Today's Attendance */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Today's Attendance</h2>
            <p>Manage your attendance for today</p>
          </div>
        </div>

        <div className="employee-attendance-card">
          <div className="employee-attendance-info">
            <div>
              <span>Check In</span>

              <strong>
                {todayRecord?.checkIn
                  ? new Date(todayRecord.checkIn).toLocaleTimeString()
                  : "--"}
              </strong>
            </div>

            <div>
              <span>Check Out</span>

              <strong>
                {todayRecord?.checkOut
                  ? new Date(todayRecord.checkOut).toLocaleTimeString()
                  : "--"}
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong
                className={`attendance-status status-${
                  todayRecord?.status || "absent"
                }`}
              >
                {todayRecord?.status || "Not Marked"}
              </strong>
            </div>
          </div>

          <div className="employee-attendance-actions">
            <button
              className="attendance-action-btn check-in-btn"
              onClick={handleCheckIn}
              disabled={actionLoading || !!todayRecord?.checkIn}
            >
              <LogIn size={18} />

              {todayRecord?.checkIn ? "Checked In" : "Check In"}
            </button>

            <button
              className="attendance-action-btn check-out-btn"
              onClick={handleCheckOut}
              disabled={
                actionLoading ||
                !todayRecord?.checkIn ||
                !!todayRecord?.checkOut
              }
            >
              <LogOut size={18} />

              {todayRecord?.checkOut ? "Checked Out" : "Check Out"}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Leaves */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recent Leave Requests</h2>
            <p>Your latest leave applications</p>
          </div>
        </div>

        {recentLeaves.length === 0 ? (
          <p className="empty-message">No leave requests found.</p>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.leaveType}</td>

                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>

                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>

                    <td>
                      {leave.duration} day
                      {leave.duration > 1 ? "s" : ""}
                    </td>

                    <td>
                      <span
                        className={`attendance-status status-${leave.approvalStatus}`}
                      >
                        {leave.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recent Attendance</h2>
            <p>Your latest attendance records</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <p className="empty-message">No attendance records found.</p>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
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
                    <td>{new Date(record.date).toLocaleDateString()}</td>

                    <td>
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString()
                        : "--"}
                    </td>

                    <td>
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString()
                        : "--"}
                    </td>

                    <td>
                      <span
                        className={`attendance-status status-${record.status}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td>{record.workingHours || 0} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
