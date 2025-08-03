import { useEffect, useState } from "react";


export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://marqueebackend.onrender.com/user-profile/${username}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-header animate__animated animate__fadeIn">
        <i className="bi bi-person-circle me-2"></i>User Profile
      </h2>
      
      <div className="profile-grid">
        {Object.entries(profile).map(([key, value]) => (
          <div 
            key={key} 
            className="profile-card animate__animated animate__fadeInUp"
            style={{ animationDelay: `${Object.keys(profile).indexOf(key) * 0.1}s` }}
          >
            <div className="profile-card-header">
              <i className={`bi bi-${getIconForField(key)}`}></i>
              <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
            </div>
            <div className="profile-card-value">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getIconForField(field) {
  const icons = {
    name: 'person',
    email: 'envelope',
    username: 'person-badge',
    role: 'person-rolodex',
    joined: 'calendar',
    tests: 'journal-check'
  };
  return icons[field.toLowerCase()] || 'info-circle';
}