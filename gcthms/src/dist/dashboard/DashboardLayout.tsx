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

  const [isSidebarHidden, setIsSidebarHidden] = useState<boolean>(() => {
    try {
    const saved = localStorage.getItem("sidebarHidden");
    const initialized = localStorage.getItem("sidebarInitialized");

    // First time loading after login
    if (!initialized) {
      localStorage.setItem("sidebarInitialized", "true");
      return true; // collapsed
    }

    return saved !== null ? JSON.parse(saved) : false; // default to expanded
  } catch (e: unknown) {
    console.warn('Error reading sidebarHidden from localStorage:', e);
    return true;
  }
});

const toggleSidebar = () => setIsSidebarHidden((prev: boolean) => !prev);

React.useEffect(() => {
  console.log("Saving sidebarHidden:", isSidebarHidden);
  localStorage.setItem("sidebarHidden", JSON.stringify(isSidebarHidden));
}, [isSidebarHidden]);

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
