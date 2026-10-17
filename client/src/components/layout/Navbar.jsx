import { Menu, Search, Bell, ChevronDown, User, X } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const fetchNotifications = async () => {
  if (!token) return;

  setNotificationsLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    setNotifications(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Notification error:", error);
  } finally {
    setNotificationsLoading(false);
  }
};

useEffect(() => {
  fetchNotifications();

  const interval = setInterval(fetchNotifications, 30000);

  return () => clearInterval(interval);
}, []);

  const role = localStorage.getItem("role") || "employee";

  const username = localStorage.getItem("name") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");

    window.location.href = "/login";
  };

  return (
    <header className="navbar">
      {/* Left */}
      <div className="navbar-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Menu size={23} />
        </button>

        <div className="search-box">
          <Search size={18} />

          <input type="text" placeholder="Search employees..." />
        </div>
      </div>

      {/* Right */}
      <div className="navbar-right">
        {/* Notifications */}
        <button
  className="notification-button"
  onClick={() => {
    setNotificationsOpen(!notificationsOpen);
    fetchNotifications();
  }}
  aria-label="Notifications"
>
  <Bell size={21} />

  {unreadCount > 0 && (
    <span className="notification-dot">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )}
</button>

{notificationsOpen && (
  <div className="notification-dropdown">
    <div className="notification-header">
      <strong>Notifications</strong>

      <button
        onClick={() => setNotificationsOpen(false)}
        aria-label="Close notifications"
      >
        <X size={18} />
      </button>
    </div>

    {notificationsLoading && notifications.length === 0 ? (
      <p>Loading notifications...</p>
    ) : notifications.length === 0 ? (
      <p>No notifications yet.</p>
    ) : (
      notifications.map((notification) => (
        <div
          key={notification._id}
          className={`notification-item ${
            notification.isRead ? "" : "unread"
          }`}
        >
          <p>{notification.message}</p>

          <small>
            {new Date(notification.createdAt).toLocaleString()}
          </small>

          {!notification.isRead && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `http://localhost:5000/api/notifications/${notification._id}/read`,
                    {
                      method: "PUT",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (!response.ok) {
                    throw new Error("Failed to mark notification as read");
                  }

                  await fetchNotifications();
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              Mark as read
            </button>
          )}
        </div>
      ))
    )}
  </div>
)}

        {/* Profile */}
        <div className="profile-container">
          <button
            className="profile-button"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="profile-avatar">
              <User size={18} />
            </div>

            <div className="profile-info">
              <strong>{username}</strong>
              <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-user">
                <div className="profile-avatar">
                  <User size={18} />
                </div>

                <div>
                  <strong>{username}</strong>
                  <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                onClick={() => {
                  window.location.href = "/profile";
                }}
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  window.location.href = "/settings";
                }}
              >
                Settings
              </button>

              <div className="dropdown-divider" />

              <button className="dropdown-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
