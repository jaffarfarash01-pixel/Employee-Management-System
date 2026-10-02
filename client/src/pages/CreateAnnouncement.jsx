
import { useEffect, useState } from "react";

function CreateAnnouncement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "department",
    department: "",
    expiresAt: "",
  });

  const fetchDepartments = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/departments",
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

      setDepartments(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.message ||
      !formData.department
    ) {
      alert("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/announcements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formData.title,
            message: formData.message,
            audience: formData.audience,
            department: formData.department,
            expiresAt: formData.expiresAt || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Announcement published successfully!");

      setFormData({
        title: "",
        message: "",
        audience: "department",
        department: "",
        expiresAt: "",
      });
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Create Announcement</h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label>Title</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Holiday Announcement"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label>Message</label>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tomorrow will be a holiday..."
            rows="5"
            required
          />
        </div>

        {/* Audience */}
        <div>
          <label>Audience</label>

          <select
            name="audience"
            value={formData.audience}
            onChange={handleChange}
          >
            <option value="department">
              Specific Department
            </option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label>Select Department</label>

          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Department
            </option>

            {departments.map((department) => (
              <option
                key={department._id}
                value={department._id}
              >
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expiry Date */}
        <div>
          <label>Expiry Date</label>

          <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          Publish Announcement
        </button>
      </form>
    </div>
  );
}

export default CreateAnnouncement;
