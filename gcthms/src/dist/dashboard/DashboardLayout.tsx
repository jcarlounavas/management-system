import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="pc-wrapper d-flex">
      <Sidebar />
      <div className="pc-content w-100">
        {/* <Header /> */}
        <main className="page-wrapper">
          <div className="page-body">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
