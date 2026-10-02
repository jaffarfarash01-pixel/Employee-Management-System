import { useState } from "react";

function ApplyLeave() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/leaves",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            leaveType,
            startDate,
            endDate,
            reason,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Leave request submitted successfully");

      // Clear form
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setDescription("");

    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  return (
    <div>
      <h1>Apply for Leave</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Leave Type</label>

          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <option value="">Select Leave Type</option>
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="emergency">Emergency Leave</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label>Start Date</label>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>End Date</label>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label>Reason</label>

          <input
            type="text"
            placeholder="Reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div>
          <label>Description</label>

          <textarea
            placeholder="Explain why you need leave..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit">
          Submit Leave Request
        </button>

      </form>
    </div>
  );
}

export default ApplyLeave;