
import { useEffect, useState } from "react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/announcements",
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

      setAnnouncements(data);
    } catch (error) {
      console.error(error);
      alert("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  if (loading) {
    return <p>Loading announcements...</p>;
  }

  return (
    <div>
      <h2>Announcements</h2>

      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((announcement) => (
          <div key={announcement._id}>
            <h3>{announcement.title}</h3>

            <p>{announcement.message}</p>

            <p>
              Department:{" "}
              {announcement.department
                ? announcement.department.name
                : "All Employees"}
            </p>

            <p>
              Posted by:{" "}
              {announcement.createdBy
                ? announcement.createdBy.name
                : "Admin"}
            </p>

            <p>
              Date:{" "}
              {new Date(
                announcement.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Announcements;