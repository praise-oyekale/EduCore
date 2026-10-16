import { useState } from "react";
import { StudentSidebar } from "../../data/sidebarData";
import { Sidebar } from "./Sidebar";
import Dashboardnavbar from "../common/DashboardNavbar";
import { useAuth } from "../../context/AuthContext";
import { Outlet } from "react-router-dom";
import "../layout/studentlayout.css"


function StudentLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
      const { user } = useAuth();
    return(
        <div className="student-layout">
            <Sidebar sections={StudentSidebar} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className="main-content">
                <Dashboardnavbar user={user} setSidebarOpen={setSidebarOpen}/>

                <main>
                    <Outlet />
                </main> 
            </div>
        </div>
    )
}

export default StudentLayout