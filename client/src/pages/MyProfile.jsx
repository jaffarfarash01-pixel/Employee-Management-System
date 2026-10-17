
import { useEffect, useState } from "react";

function MyProfile() {
  const [employee, setEmployee] = useState(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5000/api/employees/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load profile");
          return;
        }

        setEmployee(data);
      } catch (error) {
        console.error(error);
        alert("Server connection failed");
      } finally {
        setLoading(false);
      }
    };

//    useEffect( () => {
    fetchProfile();
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
  }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      alert("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setSaving(true);

    try{
        const response = await fetch(
            "http://localhost:5000/api/employees/me",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer $({localStorage.getItem("token)})`,
                },
                body: JSON.stringify({ phone: phone.trim() }),
            }
        );
        const data = await response.json();

        if(!response.ok){
            alert(data.message || "Failed to update profile");
        return;
        }
    }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!employee) {
    return <p>Profile not found.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>My Profile</h1>

      <div className="employee-info-card">
        <h2>Personal Information</h2>
        <p>
          <strong>Name:</strong> {employee.userId?.name || "-"}
        </p>
        <p>
          <strong>Email:</strong> {employee.userId?.email || "-"}
        </p>
        <p>
          <strong>Phone:</strong> {employee.phone || "-"}
        </p>
      </div>

      <div className="employee-info-card">
        <h2>Job Information</h2>
        <p>
          <strong>Employee ID:</strong> {employee.employeeId}
        </p>
        <p>
          <strong>Department:</strong>{" "}
          {employee.department?.name || "-"}
        </p>
        <p>
          <strong>Position:</strong> {employee.position || "-"}
        </p>
        <p>
          <strong>Status:</strong> {employee.status || "-"}
        </p>
      </div>
    </div>
  );
}

export default MyProfile;
