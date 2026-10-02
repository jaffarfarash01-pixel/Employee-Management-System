import { useEffect, useState } from "react";
// import { useEffect, useState } from "react";
import { Users, UserCheck, Clock3, UserX, CalendarDays } from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ManagerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const [employeeResponse, attendanceResponse] = await Promise.all([
        fetch("http://localhost:5000/api/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("http://localhost:5000/api/attendance", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const employeeData = await employeeResponse.json();
      const attendanceData = await attendanceResponse.json();

      if (!employeeResponse.ok) {
        console.error(employeeData.message);
      } else {
        setEmployees(employeeData);
      }

      if (!attendanceResponse.ok) {
        console.error(attendanceData.message);
      } else {
        setAttendance(attendanceData);
      }
    } catch (error) {
      console.error("Manager dashboard error:", error);
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

  const stats = [
    {
      title: "My Team",
      value: loading ? "..." : employees.length,
      description: "Team members",
      icon: <Users size={20} />,
    },
    {
      title: "Present Today",
      value: loading ? "..." : presentToday,
      description: "Employees present",
      icon: <UserCheck size={20} />,
    },
    {
      title: "Late Today",
      value: loading ? "..." : lateToday,
      description: "Late check-ins",
      icon: <Clock3 size={20} />,
    },
    {
      title: "Absent Today",
      value: loading ? "..." : absentToday,
      description: "Employees absent",
      icon: <UserX size={20} />,
    },
    {
      title: "On Leave Today",
      value: loading ? "..." : onLeaveToday,
      description: "Employees on leave",
      icon: <CalendarDays size={20} />,
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}

      <div className="dashboard-header">
        <div>
          <h1>Manager Dashboard</h1>

          <p>Welcome back! Here's what's happening with your team.</p>
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

      {/* Department Attendance */}

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Department Attendance</h2>

            <p>Today's attendance for your team</p>
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

export default ManagerDashboard;
