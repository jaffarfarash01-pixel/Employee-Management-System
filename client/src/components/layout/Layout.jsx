import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./layout.css";

function Layout({ children }) {
  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

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
          collapsed
            ? "main-area-expanded"
            : ""
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

export default Layout;