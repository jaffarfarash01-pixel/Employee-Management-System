import { useEffect, useState } from "react";

function MyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/attendance/my",
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

  return (
    <div>
      <h2>My Attendance</h2>

      {attendance.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <table border="1">
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
            {attendance.map((record) => (
              <tr key={record._id}>
                <td>
                  {new Date(record.date).toLocaleDateString()}
                </td>

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

export default MyAttendance;