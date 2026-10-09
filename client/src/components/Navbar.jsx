
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      setNotificationLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification error:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mark one notification as read
  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notification");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to mark notification as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notifications");
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to mark notifications as read");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        padding: "12px 20px",
        position: "relative",
        flexWrap: "wrap",
      }}
    >
      <h2>Employee Management System</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowNotifications((previous) => !previous)}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={showNotifications}
            style={{
              position: "relative",
              fontSize: "22px",
              cursor: "pointer",
              padding: "8px 12px",
            }}
          >
            🔔

            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "50%",
                  minWidth: "20px",
                  height: "20px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                width: "320px",
                maxWidth: "85vw",
                maxHeight: "400px",
                overflowY: "auto",
                background: "#fff",
                color: "#222",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                zIndex: 1000,
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <strong>Notifications</strong>

                {unreadCount > 0 && (
                  <button type="button" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <hr />

              {notificationLoading && notifications.length === 0 ? (
                <p>Loading notifications...</p>
              ) : notifications.length === 0 ? (
                <p>No notifications yet.</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    style={{
                      padding: "12px 8px",
                      marginBottom: "6px",
                      borderRadius: "6px",
                      background: notification.isRead ? "#fff" : "#eef5ff",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <p style={{ margin: "0 0 8px" }}>
                      {!notification.isRead && (
                        <span style={{ color: "#2563eb" }}>● </span>
                      )}

                      {notification.message}
                    </p>

                    {notification.relatedTask?.title && (
                      <small>
                        Task: {notification.relatedTask.title}
                      </small>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <small>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification._id)}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={fetchNotifications}
                style={{ marginTop: "8px" }}
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        <span>{user?.name}</span>
        <span>({user?.role})</span>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
