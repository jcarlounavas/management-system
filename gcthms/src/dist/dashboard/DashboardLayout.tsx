import React, { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  const toggleSidebar = () => setIsSidebarHidden(prev => !prev);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/auth"; // Or use navigate() if using react-router hooks
  };

  return (
    <div className="pc-wrapper d-flex">
      <Sidebar isSidebarHidden={isSidebarHidden} />

      <div
        className="pc-content"
        style={{
          marginLeft: isSidebarHidden ? 0 : 260,
          transition: "margin-left 0.3s ease",
          width: "100%",
        }}
      >
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 10,
            left: isSidebarHidden ? 10 : 260,
            zIndex: 1000,
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "6px 10px",
            marginLeft: "15px",
            cursor: "pointer",
            transition: "left 0.3s ease",
          }}
        >
          {isSidebarHidden ? <ArrowCircleRightIcon /> : <ArrowCircleLeftIcon />}
        </button>

        {/* Header with Logout */}
        <Header onLogout={handleLogout} />

        {/* Main Content */}
        <main className="page-wrapper">
          <div className="page-body">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
