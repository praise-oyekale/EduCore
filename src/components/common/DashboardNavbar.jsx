import { FaBars, FaBell } from "react-icons/fa";
import { FaComment } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";
import "./dashboardnavbar.css";

export default function DashboardNavbar({
  setSidebarOpen,
  profile: profileProp,
}) {
  const { user, profile: authProfile, role: authRole } = useAuth();

  // Prefer the profile passed by the dashboard, then the AuthContext profile.
  const profile = profileProp || authProfile || {};

  // Determine the user's role.
  const role = (profile.role || authRole || user?.role || "user").toLowerCase();

  // Get the user's name from their profile or authentication data.
  const displayName =
    profile.fullName ||
    profile.displayName ||
    user?.fullName ||
    user?.displayName ||
    "User";

  // Get the user's profile picture.
  const photoURL = profile.photoURL || user?.photoURL || "";

  // Get additional information to display under the user's name.
  const getRoleOrClass = () => {
    switch (role) {
      case "admin":
      case "administrator":
        return "Administrator";

      case "teacher":
        return (
          profile.title ||
          profile.subject ||
          profile.department ||
          user?.department ||
          "Teacher Portal"
        );

      case "student":
        return (
          profile.grade ||
          profile.className ||
          profile.class ||
          profile.department ||
          "Student Portal"
        );

      default:
        return "Dashboard";
    }
  };

  const roleOrClass = getRoleOrClass();

  return (
    <nav className="dashboard-navbar">
      {/* Sidebar toggle */}
      <button
        type="button"
        className="nav-harmburger"
        onClick={() => setSidebarOpen?.((previous) => !previous)}
        aria-label="Toggle sidebar"
      >
        <FaBars />
      </button>

      {/* Right-side navbar content */}
      <div className="nav-left-contents">
        {/* Messages */}
        <button
          type="button"
          className="dashboardnav-messages"
          aria-label="Messages"
        >
          <FaComment />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="dashboardnav-notification"
          aria-label="Notifications"
        >
          <FaBell />
        </button>

        {/* User profile */}
        <div className="dashboardnav-profile-chip">
          <div className="dashboardnav-avatar">
            <Avatar photoURL={photoURL} name={displayName} size={40} />
          </div>

          <div className="dashboardnav-profile-info">
            <div className="dashboardnav-profile-name">{displayName}</div>

            <div className="dashboardnav-role">{roleOrClass}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
