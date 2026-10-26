import { NavLink, useNavigate } from "react-router-dom";
import schoollogo from "../../assets/images/smslogo.png";
import "../layout/sidebar.css";
import { FaSignOutAlt, FaTimes, FaLock } from "react-icons/fa";
import { LogOutUser } from "../../services/authService";

export function Sidebar({ sections, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  async function handleSignout() {
    await LogOutUser();
    navigate("/login");
  }

  return (
    <div className={`sidebar-container ${sidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-header">
        <img src={schoollogo} alt="schoollogo" className="sidebar-headerlogo" />
        <div className="sidebar-headername">
          <h2>EduCore</h2>
          <p>His Grace International</p>
        </div>

        {sidebarOpen && (
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <h4>{section.title}</h4>

            {section.items.map((item) => {
              const isLocked = item.isLocked;
              const IconComponent = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={isLocked ? "#" : item.path}
                  end
                  className={({ isActive }) =>
                    `sidebar-link ${isActive && !isLocked ? "active" : ""} ${
                      isLocked ? "locked" : ""
                    }`
                  }
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      return;
                    }
                    setSidebarOpen(false);
                  }}
                  title={isLocked ? `${item.label} (Coming Soon)` : item.label}
                >
                  <div className="sidebar-link-content">
                    <div className="sidebar-link-header">
                      {IconComponent && (
                        <span className="sidebar-item-icon">
                          <IconComponent />
                        </span>
                      )}
                      <span>{item.label}</span>
                    </div>

                    {isLocked && <FaLock className="sidebar-lock-icon" />}
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="signout-section" onClick={handleSignout}>
          <FaSignOutAlt />
          <span>SignOut</span>
        </div>
      </div>
    </div>
  );
}
