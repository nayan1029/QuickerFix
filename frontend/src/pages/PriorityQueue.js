import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const PriorityQueue = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPriorityQueue().then(res => setReports(res.data)).catch(console.error);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🔢 QuickerFix Priority Algorithm</h2>
      
      <div className="card p-4 mb-4 bg-light">
        <h4>Formula Breakdown</h4>
        <pre className="fs-6">
Priority Score = Severity (30%) + Duplicate Reports (25%) + Age/Days Old (20%) + Community Upvotes (15%) + Location (10%)
Max Score = 100
        </pre>
        <div className="row mt-3">
          <div className="col-md-6">
            <div className="card p-3 border-success mb-2">
              <strong>Example 1: Broken Streetlight</strong>
              <div>Severity: Low (10/30)</div>
              <div>Upvotes: 2 (3/15)</div>
              <div>Age: 1 day (2/20)</div>
              <div className="text-success fw-bold">Total Score: 35</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3 border-danger mb-2">
              <strong>Example 2: Major Water Main Burst</strong>
              <div>Severity: Critical (30/30)</div>
              <div>Duplicates/Upvotes: High (35/40)</div>
              <div>Location: Hospital Zone (10/10)</div>
              <div className="text-danger fw-bold">Total Score: 92</div>
            </div>
          </div>
        </div>
      </div>

      <h4 className="mb-3">Live Priority Queue</h4>
      <div className="card p-3">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Score Bar</th>
              <th>Report Title</th>
              <th>Category</th>
              <th>Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, index) => (
              <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/reports/${r.id}`)}>
                <td className="fw-bold h5">#{index + 1}</td>
                <td style={{ width: '200px' }}>
                  <div className="fw-bold">{r.priorityScore} / 100</div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className={`progress-bar bg-${r.priorityScore > 70 ? 'danger' : r.priorityScore > 40 ? 'warning' : 'success'}`} style={{ width: `${r.priorityScore}%` }}></div>
                  </div>
                </td>
                <td>{r.title}</td>
                <td>{r.category?.name}</td>
                <td>{Math.floor((new Date() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24))} days</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan="6" className="text-center">No reports in queue.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriorityQueue;
