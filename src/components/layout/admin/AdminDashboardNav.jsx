import { FaBars, FaBell,   } from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext";
import "../../common/dashboardnavbar.css";
import { FaComment, FaCommentSms } from "react-icons/fa6";

export default function AdminDashboardNavbar({  setSidebarOpen, profile, sidebarOpen }) {
  return (
    <nav className="dashboard-navbar">
      <div className="nav-harmburger" onClick={()=> setSidebarOpen(true)}>
        <FaBars />
      </div>
      <div className="nav-left-contents">
        <div className="dashboardnav-messages"> <FaComment/> </div>
        <div className="dashboardnav-notification"><FaBell/> </div>
        <div className="dashboardnav-profile-chip">
          <div className="dashboardnav-avatar">PO</div>
          <div>
            <div className="dashboardnav-profile-name">{profile?.fullName}</div>
            <div className="dashboardnav-role">School Administrator</div>
          </div>
        </div>
      </div>
    </nav>
  );
}