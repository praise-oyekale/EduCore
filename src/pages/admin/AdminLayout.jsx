import { Outlet } from "react-router-dom";
import AdminDashboardNavbar from "../../components/layout/admin/AdminDashboardNav";
import { Sidebar } from "../../components/layout/Sidebar";
import { AdminSidebar } from "../../data/sidebarData";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, role } = useAuth();
  return (
    <div className="teacher-layout">
      <Sidebar
        sections={AdminSidebar}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="main-content">
        <AdminDashboardNavbar
          profile={profile}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
