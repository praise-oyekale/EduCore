import { useState } from "react";
import { TeacherSidebar } from "../../data/sidebarData";
import { Sidebar } from "./Sidebar";
// import Dashboardnavbar from "../common/DashboardNavbar";
import { useAuth } from "../../context/AuthContext";
import { Outlet } from "react-router-dom";
import TeacherDashboardNavbar from "./teacher/TeacherDashboardNav";
import "../layout/teacherlayout.css"

function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const{user, profile, role} = useAuth();
  return (
    <div className="teacher-layout">
      <Sidebar
        sections={TeacherSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content">
        <TeacherDashboardNavbar profile={profile}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen} />
        <main>
            <Outlet/>
        </main>
      </div>
    </div>
  );
} 

export default TeacherLayout;
