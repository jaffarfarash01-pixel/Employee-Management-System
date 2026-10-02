import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
} from "lucide-react";
import { useState } from "react";

function Navbar({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const role = localStorage.getItem("role") || "employee";

  const username =
    localStorage.getItem("name") || "User";

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

        <button
          className="menu-button"
          onClick={onMenuClick}
        >
          <Menu size={23} />
        </button>

        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search employees..."
          />
        </div>

      </div>

      {/* Right */}
      <div className="navbar-right">

        {/* Notifications */}
        <button className="notification-button">
          <Bell size={21} />

          <span className="notification-dot" />
        </button>

        {/* Profile */}
        <div className="profile-container">

          <button
            className="profile-button"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
          >

            <div className="profile-avatar">
              <User size={18} />
            </div>

            <div className="profile-info">
              <strong>{username}</strong>
              <span>
                {role.charAt(0).toUpperCase() +
                  role.slice(1)}
              </span>
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
                  <span>
                    {role.charAt(0).toUpperCase() +
                      role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                onClick={() => {
                  window.location.href =
                    "/profile";
                }}
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  window.location.href =
                    "/settings";
                }}
              >
                Settings
              </button>

              <div className="dropdown-divider" />

              <button
                className="dropdown-logout"
                onClick={handleLogout}
              >
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