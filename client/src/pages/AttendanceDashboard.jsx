import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import * as XLSX from "xlsx";

ChartJS.register(ArcElement, Tooltip, Legend);

function AttendanceDashboard() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const fetchAttendance = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/attendance/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setAttendance(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return <p>Loading attendance...</p>;
  }

  // Filter attendance by selected date
  const filteredAttendance = selectedDate
    ? attendance.filter((record) => {
        const recordDate = new Date(record.date);

        const year = recordDate.getFullYear();
        const month = String(recordDate.getMonth() + 1).padStart(2, "0");
        const day = String(recordDate.getDate()).padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate === selectedDate;
      })
    : attendance;

  // Count attendance statuses
  const presentCount = filteredAttendance.filter(
    (record) => record.status === "present",
  ).length;

  const lateCount = filteredAttendance.filter(
    (record) => record.status === "late",
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => record.status === "absent",
  ).length;

  const leaveCount = filteredAttendance.filter(
    (record) => record.status === "on-leave",
  ).length;

  const chartData = {
    labels: ["Present", "Late", "Absent", "On Leave"],
    datasets: [
      {
        data: [presentCount, lateCount, absentCount, leaveCount],
      },
    ],
  };

  const exportToExcel = () => {
    if (filteredAttendance.length === 0) {
      alert("No attendance records to export");
      return;
    }

    const excelData = filteredAttendance.map((record) => ({
      Date: new Date(record.date).toLocaleDateString(),

      Employee: record.employee?.name || "",

      Email: record.employee?.email || "",

      "Check In": record.checkIn
        ? new Date(record.checkIn).toLocaleTimeString()
        : "-",

      "Check Out": record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString()
        : "-",

      Status: record.status,

      "Working Hours": record.workingHours,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    XLSX.writeFile(workbook, "Attendance.xlsx");
  };

  return (
    <div>
      <h2>Attendance Dashboard</h2>

      {/* Date Filter */}
      <div>
        <label>Select Date: </label>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button onClick={() => setSelectedDate("")}>Clear</button>
        <button onClick={exportToExcel}>Export to Excel</button>
      </div>

      <br />

      {/* Pie Chart */}
      <div style={{ width: "400px" }}>
        <Pie data={chartData} />
      </div>

      <br />

      {/* Attendance Table */}
      {filteredAttendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Email</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Status</th>
              <th>Working Hours</th>
            </tr>
          </thead>

          <tbody>
            {filteredAttendance.map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.date).toLocaleDateString()}</td>

                <td>{record.employee?.name}</td>

                <td>{record.employee?.email}</td>

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

                <td>{record.status}</td>

                <td>{record.workingHours} hours</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AttendanceDashboard;
