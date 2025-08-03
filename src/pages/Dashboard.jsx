import { useState } from "react";
import Profile from "./Profile";
import TestEntrance from "./TestEntrance";


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div 
          className={`sidebar-item ${activeTab === "profile" ? 'active' : ''}`}
          onClick={() => setActiveTab("profile")}
        >
          <i className="bi bi-person-circle"></i>
          <span>Profile</span>
        </div>
        <div 
          className={`sidebar-item ${activeTab === "test" ? 'active' : ''}`}
          onClick={() => setActiveTab("test")}
        >
          <i className="bi bi-journal-text"></i>
          <span>Test Entrance</span>
        </div>
      </div>

      <div className="main-content">
        {activeTab === "profile" ? <Profile /> : <TestEntrance />}
      </div>
    </div>
  );
}