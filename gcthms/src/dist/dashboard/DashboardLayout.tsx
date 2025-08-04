import React, { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface SidebarProps {
  isSidebarHidden: boolean;
}


const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
const toggleSidebar = () => setIsSidebarHidden(prev => !prev);


  return (
    <div className="pc-wrapper d-flex">
      <Sidebar isSidebarHidden={isSidebarHidden}/>
      <div className="pc-content" style={{
    marginLeft: isSidebarHidden ? 0 : 260,
    transition: 'margin-left 0.3s ease',
    width: '100%',
  }}  >
    
    <button
  onClick={toggleSidebar}
  style={{  
    position: "fixed",
    top: 10,
    left: isSidebarHidden ? 10 : 260, // adjust if sidebar is wider
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
  {isSidebarHidden ? <ArrowCircleRightIcon />  :  <ArrowCircleLeftIcon /> }
</button>
        {/* <Header /> */}
        <main className="page-wrapper">
          
          <div className="page-body">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
