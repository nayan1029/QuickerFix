import React, { useState, useEffect } from 'react';
import { announcementService } from '../services/announcementService';
import { toast } from 'react-toastify';
import './Announcements.css';

const Announcements = ({ districtId = null, categoryId = null }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [highPriority, setHighPriority] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
    fetchUnreadCount();
  }, [districtId, categoryId]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let response;
      if (districtId) {
        response = await announcementService.getByDistrict(districtId);
      } else if (categoryId) {
        response = await announcementService.getByCategory(categoryId);
      } else {
        response = await announcementService.getAnnouncements();
      }
      setAnnouncements(response.data || []);

      // Fetch high-priority separately
      const highRes = await announcementService.getHighPriority();
      setHighPriority(highRes.data || []);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await announcementService.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      await announcementService.markAsRead(announcementId);
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === announcementId ? { ...ann, isRead: true } : ann
        )
      );
      fetchUnreadCount();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info'
    };
    return priorityMap[priority] || 'secondary';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="announcements-container">
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <span>📢 You have <strong>{unreadCount}</strong> unread announcements</span>
          <button className="btn btn-sm btn-outline-info" onClick={fetchAnnouncements}>
            🔄 Refresh
          </button>
        </div>
      )}

      {/* High Priority Announcements */}
      {highPriority.length > 0 && (
        <div className="high-priority-section mb-4">
          <h5 className="text-danger mb-3">🚨 High Priority Announcements</h5>
          {highPriority.map((announcement) => (
            <div key={announcement.id} className="card card-danger mb-2">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="card-title text-danger mb-1">
                      ⚠️ {announcement.title}
                    </h6>
                    <p className="card-text mb-2">{announcement.content.substring(0, 150)}...</p>
                    <small className="text-muted">
                      📅 {formatDate(announcement.createdAt)}
                    </small>
                  </div>
                  <span className={`badge bg-${getPriorityBadge(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                {!announcement.isRead && (
                  <button
                    className="btn btn-sm btn-danger mt-2"
                    onClick={() => handleMarkAsRead(announcement.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      <h5 className="mb-3">📋 Announcements</h5>
      <div className="announcements-list">
        {announcements.length === 0 ? (
          <div className="alert alert-secondary text-center">
            <p>No announcements available</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`card mb-2 announcement-card ${
                !announcement.isRead ? 'unread' : ''
              }`}
            >
              <div
                className="card-header"
                onClick={() =>
                  setExpandedId(expandedId === announcement.id ? null : announcement.id)
                }
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">
                      {!announcement.isRead && '🔔 '}
                      {announcement.title}
                    </h6>
                    <small className="text-muted">
                      {announcement.scope === 'DISTRICT' && '📍 District Specific'}
                      {announcement.scope === 'CATEGORY' && '📁 Category Specific'}
                      {announcement.scope === 'ALL' && '🌍 System Wide'}
                    </small>
                  </div>
                  <span className={`badge bg-${getPriorityBadge(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
              </div>

              {expandedId === announcement.id && (
                <div className="card-body">
                  <p className="card-text">{announcement.content}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      📅 {formatDate(announcement.createdAt)}
                      {announcement.expiresAt && (
                        <span>
                          {' '}
                          | Expires: {formatDate(announcement.expiresAt)}
                        </span>
                      )}
                    </small>
                    {!announcement.isRead && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleMarkAsRead(announcement.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
