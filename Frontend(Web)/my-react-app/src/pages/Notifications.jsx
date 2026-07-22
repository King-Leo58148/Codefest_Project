import React, { useState, useEffect } from 'react';
import api from '../api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <h2>Notifications</h2>
      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {notifications.map((notif) => (
            <div key={notif.id} className="card" style={{ padding: '16px' }}>
              <h4>{notif.title || notif.businessName || 'Notification'}</h4>
              <p style={{ color: 'var(--text-muted)' }}>{notif.message || notif.text || notif.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
