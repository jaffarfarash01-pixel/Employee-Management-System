import { useEffect, useState } from "react";

function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/leaves",
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

  const updateLeaveStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    const reviewMessage =
      status === "approved"
        ? "Leave approved."
        : "Leave rejected.";

    try {
      const response = await fetch(
        `http://localhost:5000/api/leaves/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approvalStatus: status,
            reviewMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert(data.message);

      // Refresh leave list
      fetchLeaves();
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  if (loading) {
    return <p>Loading leave requests...</p>;
  }

  return (
    <div>
      <h1>Leave Requests</h1>

      {leaves.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>{leave.employee?.name}</td>

                <td>{leave.leaveType}</td>

                <td>
                  {new Date(
                    leave.startDate
                  ).toLocaleDateString()}
                </td>

                <td>
                  {new Date(
                    leave.endDate
                  ).toLocaleDateString()}
                </td>

                <td>{leave.duration} days</td>

                <td>{leave.reason}</td>

                <td>{leave.approvalStatus}</td>

                <td>
                  {leave.approvalStatus === "pending" ? (
                    <>
                      <button
                        onClick={() =>
                          updateLeaveStatus(
                            leave._id,
                            "approved"
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateLeaveStatus(
                            leave._id,
                            "rejected"
                          )
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    "Reviewed"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LeaveRequests;