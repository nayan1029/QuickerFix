import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const CitizenPortal = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [categories, setCategories] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '', description: '', categoryId: '', severity: 'LOW', address: '', lat: '', lng: ''
  });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    api.getCategories().then(res => setCategories(res.data)).catch(console.error);
    if (activeTab === 'my') {
      api.getMyReports().then(res => setMyReports(res.data)).catch(console.error);
    }
  }, [activeTab]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handlePhotoChange = (e) => setPhotos(e.target.files);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData({ ...formData, lat: pos.coords.latitude, lng: pos.coords.longitude, address: `Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}` });
    }, console.error);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    Array.from(photos).forEach(file => data.append('photos', file));
    try {
      await api.createReport(data);
      setActiveTab('my');
    } catch (err) {
      console.error(err);
    }
  };

  const getNearby = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await api.getNearbyReports(pos.coords.latitude, pos.coords.longitude, 10);
        setNearbyReports(res.data);
      } catch (err) {
        console.error(err);
      }
    }, console.error);
  };

  const handleUpvote = async (id) => {
    try {
      await api.upvoteReport(id);
      getNearby();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>Report a Problem</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My Complaints</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>Nearby Issues</button>
        </li>
      </ul>

      {activeTab === 'report' && (
        <div className="card p-4">
          <h2>Report a Problem</h2>
          <form onSubmit={submitReport}>
            <div className="mb-3">
              <label className="form-label">Category</label>
              <select name="categoryId" className="form-select" onChange={handleInputChange} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-control" onChange={handleInputChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="3" onChange={handleInputChange} required></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Severity</label>
              <div className="btn-group w-100">
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(sev => (
                  <React.Fragment key={sev}>
                    <input type="radio" className="btn-check" name="severity" id={sev} value={sev} checked={formData.severity === sev} onChange={handleInputChange} />
                    <label className="btn btn-outline-primary" htmlFor={sev}>{sev}</label>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Location</label>
              <div className="input-group">
                <input type="text" name="address" className="form-control" value={formData.address} onChange={handleInputChange} required />
                <button type="button" className="btn btn-secondary" onClick={getLocation}>📍 Use My Location</button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Photos</label>
              <input type="file" className="form-control" multiple onChange={handlePhotoChange} />
            </div>
            <button type="submit" className="btn btn-success">Submit Report</button>
          </form>
        </div>
      )}

      {activeTab === 'my' && (
        <div className="row">
          {myReports.map(report => (
            <div key={report.id} className="col-md-6 mb-3">
              <div className="card p-3 cursor-pointer" onClick={() => navigate(`/reports/${report.id}`)} style={{ cursor: 'pointer' }}>
                <h5>{report.category?.icon} {report.title}</h5>
                <p className="text-muted">{new Date(report.createdAt).toLocaleDateString()}</p>
                <div>
                  <StatusBadge status={report.status} />
                  <span className="badge bg-secondary ms-2">Priority: {report.priorityScore}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'nearby' && (
        <div>
          <button className="btn btn-primary mb-4" onClick={getNearby}>🗺️ Find Nearby Issues</button>
          <div className="row">
            {nearbyReports.map(report => (
              <div key={report.id} className="col-md-6 mb-3">
                <div className="card p-3">
                  <h5 style={{ cursor: 'pointer' }} onClick={() => navigate(`/reports/${report.id}`)}>{report.category?.icon} {report.title}</h5>
                  <p>{report.address}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <StatusBadge status={report.status} />
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleUpvote(report.id)}>👍 Upvote ({report.upvoteCount})</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenPortal;
