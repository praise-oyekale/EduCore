import { useState } from "react";
import { Outlet } from "react-router-dom";

import { TeacherSidebar } from "../../data/sidebarData";
import { Sidebar } from "./Sidebar";
import DashboardNavbar from "../common/DashboardNavbar";

import "../layout/teacherlayout.css";

function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="teacher-layout">
      <Sidebar
        sections={TeacherSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="main-content">
        <DashboardNavbar setSidebarOpen={setSidebarOpen} />

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TeacherLayout;
