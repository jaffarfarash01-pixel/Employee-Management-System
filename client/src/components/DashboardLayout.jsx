import { useState } from "react";
import Navbar from "./layout/Navbar";
import Sidebar from "./layout/Sidebar";
import "./layout/layout.css";

function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className="app-layout">

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        closeMobile={closeMobile}
      />

      <div
        className={`main-area ${
          collapsed ? "main-area-expanded" : ""
        }`}
      >

        <Navbar
          onMenuClick={handleMenuClick}
        />

        <main className="page-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;