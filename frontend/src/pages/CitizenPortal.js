import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const CitizenPortal = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [categories, setCategories] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', categoryId: '', severity: 'MEDIUM', address: '', lat: '', lng: '' });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadMyReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getMyReports();
      setMyReports(response.data || []);
      setError('');
    } catch (requestError) {
      setError('Could not load your reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getCategories()
      .then(response => setCategories(response.data || []))
      .catch(() => setError('Could not load issue categories. Please refresh and try again.'));
  }, []);

  useEffect(() => {
    if (activeTab === 'my') loadMyReports();
  }, [activeTab, loadMyReports]);

  const changeField = (event) => setFormData(current => ({ ...current, [event.target.name]: event.target.value }));

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location services are not available in this browser. Enter the address manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setFormData(current => ({
        ...current,
        lat: coords.latitude,
        lng: coords.longitude,
        address: current.address || `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
      })),
      () => setError('Could not read your location. Check browser permissions or enter it manually.')
    );
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createReport({ ...formData, photos });
      setFormData({ title: '', description: '', categoryId: '', severity: 'MEDIUM', address: '', lat: '', lng: '' });
      setPhotos([]);
      setActiveTab('my');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Report could not be submitted. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError('Location services are not available in this browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await api.getNearbyReports(coords.latitude, coords.longitude, 500);
        setNearbyReports(response.data || []);
      } catch (requestError) {
        setError('Nearby reports could not be loaded. Please try again.');
      } finally {
        setLoading(false);
      }
    }, () => {
      setLoading(false);
      setError('Could not read your location. Check browser permissions and try again.');
    });
  };

  const upvote = async (reportId) => {
    try {
      await api.upvoteReport(reportId);
      findNearby();
    } catch (requestError) {
      setError('Your vote could not be saved. Please try again.');
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <span className="eyebrow text-primary bg-white border">Citizen workspace</span>
        <h1 className="mt-3">Report and follow local issues</h1>
        <p className="text-muted">Share a clear description and location so the right team can respond.</p>
      </div>
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item"><button className={`nav-link ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>New report</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My reports</button></li>
        <li className="nav-item"><button className={`nav-link ${activeTab === 'nearby' ? 'active' : ''}`} onClick={() => setActiveTab('nearby')}>Nearby reports</button></li>
      </ul>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {activeTab === 'report' && <div className="card p-4">
        <h2 className="h4 mb-3">Describe the issue</h2>
        <form onSubmit={submitReport}>
          <div className="mb-3"><label className="form-label" htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" className="form-select" value={formData.categoryId} onChange={changeField} required>
              <option value="">Choose a category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="mb-3"><label className="form-label" htmlFor="title">Title</label><input id="title" name="title" className="form-control" value={formData.title} onChange={changeField} maxLength="160" required /></div>
          <div className="mb-3"><label className="form-label" htmlFor="description">Description</label><textarea id="description" name="description" className="form-control" rows="4" value={formData.description} onChange={changeField} required /></div>
          <fieldset className="mb-3"><legend className="form-label">Severity</legend><div className="btn-group w-100">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(severity => <React.Fragment key={severity}><input type="radio" className="btn-check" name="severity" id={`severity-${severity}`} value={severity} checked={formData.severity === severity} onChange={changeField} /><label className="btn btn-outline-primary" htmlFor={`severity-${severity}`}>{severity}</label></React.Fragment>)}
          </div></fieldset>
          <div className="mb-3"><label className="form-label" htmlFor="address">Location</label><div className="input-group"><input id="address" name="address" className="form-control" value={formData.address} onChange={changeField} required /><button type="button" className="btn btn-outline-secondary" onClick={useCurrentLocation}>Use my location</button></div></div>
          <div className="mb-3"><label className="form-label" htmlFor="photos">Photos (up to 10 MB each)</label><input id="photos" type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="form-control" multiple onChange={event => setPhotos(Array.from(event.target.files || []))} /></div>
          <button type="submit" className="btn btn-primary" disabled={loading || categories.length === 0}>{loading ? 'Submitting…' : 'Submit report'}</button>
        </form>
      </div>}

      {activeTab === 'my' && <section aria-live="polite">
        {loading ? <p>Loading your reports…</p> : myReports.length === 0 ? <div className="empty-state"><h2 className="h5">No reports yet</h2><p>Your submitted issues will appear here with their latest status.</p><button className="btn btn-primary" onClick={() => setActiveTab('report')}>Create a report</button></div> :
          <div className="row g-3">{myReports.map(report => <div key={report.id} className="col-md-6"><button type="button" className="card p-3 h-100 w-100 text-start" onClick={() => navigate(`/reports/${report.id}`)}><span className="text-muted">{report.categoryName}</span><strong className="my-2">{report.title}</strong><span><StatusBadge status={report.status} /> <span className="badge bg-secondary ms-2">Priority {report.priorityScore}</span></span></button></div>)}</div>}
      </section>}

      {activeTab === 'nearby' && <section>
        <button className="btn btn-primary mb-3" onClick={findNearby} disabled={loading}>{loading ? 'Finding reports…' : 'Find reports within 500 m'}</button>
        {nearbyReports.length === 0 ? <p className="text-muted">Use your location to find active reports in your area.</p> : <div className="row g-3">{nearbyReports.map(report => <div key={report.id} className="col-md-6"><div className="card p-3 h-100"><button className="btn btn-link text-start p-0" onClick={() => navigate(`/reports/${report.id}`)}><strong>{report.title}</strong></button><p className="text-muted mt-2">{report.address}</p><div className="d-flex justify-content-between align-items-center"><StatusBadge status={report.status} /><button className="btn btn-sm btn-outline-primary" onClick={() => upvote(report.id)}>Upvote ({report.upvoteCount})</button></div></div></div>)}</div>}
      </section>}
    </div>
  );
};

export default CitizenPortal;
