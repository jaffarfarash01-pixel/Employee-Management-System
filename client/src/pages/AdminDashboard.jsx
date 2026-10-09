import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");

    try {
      const [employeeResponse, departmentResponse, attendanceResponse] =
        await Promise.all([
          fetch("http://localhost:5000/api/employees", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/departments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/attendance", {
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

      const employeeData = await employeeResponse.json();
      const departmentData = await departmentResponse.json();
      const attendanceData = await attendanceResponse.json();
      const taskData = await taskResponse.json();

      if (!employeeResponse.ok) {
        console.error(employeeData.message);
      } else {
        setEmployees(employeeData);
      }

      if (!departmentResponse.ok) {
        console.error(departmentData.message);
      } else {
        setDepartments(departmentData);
      }

      if (!attendanceResponse.ok) {
        console.error(attendanceData.message);
      } else {
        setAttendance(attendanceData);
      }

      if (!taskResponse.ok) {
        console.error(taskData.message);
      } else {
        setTasks(Array.isArray(taskData) ? taskData : []);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayAttendance = attendance.filter((record) => {
    const recordDate = new Date(record.date);

    return (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    );
  });

  const presentToday = todayAttendance.filter(
    (record) => record.status === "present",
  ).length;

  const lateToday = todayAttendance.filter(
    (record) => record.status === "late",
  ).length;

  const absentToday = todayAttendance.filter(
    (record) => record.status === "absent",
  ).length;

  const onLeaveToday = todayAttendance.filter(
    (record) => record.status === "on-leave",
  ).length;

  const attendanceChartData = [
    {
      name: "Present",
      value: presentToday,
      color: "#22c55e",
    },
    {
      name: "Late",
      value: lateToday,
      color: "#f59e0b",
    },
    {
      name: "Absent",
      value: absentToday,
      color: "#ef4444",
    },
    {
      name: "On Leave",
      value: onLeaveToday,
      color: "#3b82f6",
    },
  ];

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter((task) => task.status === "todo").length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const stats = [
    {
      title: "Total Employees",
      value: loading ? "..." : employees.length,
      description: "Active employees",
      icon: "👥",
    },
    {
      title: "Departments",
      value: loading ? "..." : departments.length,
      description: "Active departments",
      icon: "🏢",
    },
    {
      title: "Present Today",
      value: loading ? "..." : presentToday,
      description: "Employees present",
      icon: "✓",
    },
    {
      title: "On Leave Today",
      value: loading ? "..." : onLeaveToday,
      description: "Approved leaves",
      icon: "📅",
    },
    {
      title: "Late Today",
      value: loading ? "..." : lateToday,
      description: "Late check-ins",
      icon: "◷",
    },
    {
      title: "Absent Today",
      value: loading ? "..." : absentToday,
      description: "Employees absent",
      icon: "✕",
    },
    {
      title: "Pending Leave",
      value: "0",
      description: "Requests waiting",
      icon: "⏳",
    },
    {
      title: "Pending Payroll",
      value: "0",
      description: "Coming soon",
      icon: "₹",
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>Welcome back! Here's what's happening in your organization.</p>
        </div>

        <div className="dashboard-date">{formattedDate}</div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-top">
              <div className="stat-icon">{stat.icon}</div>
            </div>

            <div className="stat-value">{stat.value}</div>

            <div className="stat-title">{stat.title}</div>

            <div className="stat-description">{stat.description}</div>
          </div>
        ))}
      </div>
      {/* Attendance Overview */}

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Attendance Overview</h2>
            <p>Today's employee attendance</p>
          </div>
        </div>

        <div className="attendance-chart">
          {todayAttendance.length === 0 ? (
            <p className="empty-message">
              No attendance data available for today.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={attendanceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Task Statistics */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Task Statistics</h2>
            <p>Overview of tasks across the organization</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">📋</div>
            </div>
            <div className="stat-value">{loading ? "..." : totalTasks}</div>
            <div className="stat-title">Total Tasks</div>
            <div className="stat-description">All tasks</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">⏳</div>
            </div>
            <div className="stat-value">{loading ? "..." : pendingTasks}</div>
            <div className="stat-title">To Do</div>
            <div className="stat-description">Tasks not started</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">🔄</div>
            </div>
            <div className="stat-value">
              {loading ? "..." : inProgressTasks}
            </div>
            <div className="stat-title">In Progress</div>
            <div className="stat-description">Tasks being worked on</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">✅</div>
            </div>
            <div className="stat-value">{loading ? "..." : completedTasks}</div>
            <div className="stat-title">Completed</div>
            <div className="stat-description">Finished tasks</div>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Today's Attendance</h2>
            <p>Attendance records for today</p>
          </div>
        </div>

        <div className="attendance-table-wrapper">
          {todayAttendance.length === 0 ? (
            <p className="empty-message">
              No attendance records found for today.
            </p>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Working Hours</th>
                </tr>
              </thead>

              <tbody>
                {todayAttendance.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div className="employee-name">
                        {record.employee?.name || "Unknown"}
                      </div>
                    </td>

                    <td>{record.employee?.email || "-"}</td>

                    <td>
                      {record.checkIn
                        ? new Date(record.checkIn).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td>
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleTimeString()
                        : "-"}
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
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Recent Activity</h2>
            <p>Latest employee attendance activity</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <p className="empty-message">No recent activity found.</p>
        ) : (
          <div className="activity-list">
            {attendance.slice(0, 5).map((record) => (
              <div className="activity-item" key={record._id}>
                <div className="activity-icon">
                  <Clock3 size={18} />
                </div>

                <div className="activity-content">
                  <div className="activity-title">
                    {record.employee?.name || "Unknown Employee"}
                  </div>

                  <div className="activity-description">
                    {record.checkIn
                      ? `Checked in at ${new Date(
                          record.checkIn,
                        ).toLocaleTimeString()}`
                      : `Attendance marked as ${record.status}`}
                  </div>
                </div>

                <span className={`attendance-status status-${record.status}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
