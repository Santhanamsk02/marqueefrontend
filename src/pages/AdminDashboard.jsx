import { Link, useLocation } from "react-router-dom";


export default function AdminDashboard() {
  const location = useLocation();
  
  const menuItems = [
    { path: "/admin/students", icon: "bi-people-fill", label: "Manage Students" },
    { path: "/admin/results", icon: "bi-clipboard-data", label: "View Results" },
    { path: "/admin/questions", icon: "bi-journal-text", label: "Manage Questions" },
  ];

  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <i className="bi bi-shield-lock"></i>
          <h3>Admin Panel</h3>
        </div>
        
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="main-content">
        <div className="admin-header animate__animated animate__fadeIn">
          <h2>
            <i className="bi bi-speedometer2 me-2"></i>
            Admin Dashboard
          </h2>
          <p>Manage all system operations from this panel</p>
        </div>

        <div className="admin-cards">
          {menuItems.map((item, index) => (
            <Link 
              to={item.path} 
              key={item.path}
              className={`admin-card animate__animated animate__fadeInUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card-icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              <h3>{item.label}</h3>
              <div className="card-arrow">
                <i className="bi bi-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}