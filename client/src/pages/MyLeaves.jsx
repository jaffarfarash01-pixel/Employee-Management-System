import { useEffect, useState } from "react";

function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/leaves/my-leaves",
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

      setLeaves(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  if (loading) {
    return <p>Loading leaves...</p>;
  }

  return (
    <div>
      <h1>My Leave Requests</h1>

      {leaves.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Review Message</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.leaveType}</td>

                <td>
                  {new Date(leave.startDate).toLocaleDateString()}
                </td>

                <td>
                  {new Date(leave.endDate).toLocaleDateString()}
                </td>

                <td>{leave.duration} days</td>

                <td>{leave.reason}</td>

                <td>{leave.approvalStatus}</td>

                <td>
                  {leave.reviewMessage || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyLeaves;