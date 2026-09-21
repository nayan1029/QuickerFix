import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const WorkerPortal = () => {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, inProgressCount: 0, resolvedCount: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
    api.getWorkerStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.getMyAssignments();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.acceptAssignment(id);
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (reason) {
        await api.rejectAssignment(id, { reason });
        fetchAssignments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkInProgress = async (reportId) => {
    try {
      await api.updateStatus(reportId, { status: 'IN_PROGRESS' });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (reportId, e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.resolveReport(reportId, formData);
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Worker Dashboard</h2>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card p-3 text-center bg-light">
            <h4>Pending</h4>
            <div className="display-6">{stats.pendingCount}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center bg-light">
            <h4>In Progress</h4>
            <div className="display-6">{stats.inProgressCount}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 text-center bg-light">
            <h4>Completed</h4>
            <div className="display-6">{stats.resolvedCount}</div>
          </div>
        </div>
      </div>

      <h4>My Assignments</h4>
      <div className="row">
        {assignments.map(assign => (
          <div key={assign.id} className="col-md-6 mb-4">
            <div className="card p-4 h-100">
              <h5 style={{ cursor: 'pointer' }} onClick={() => navigate(`/reports/${assign.report.id}`)}>{assign.report.title}</h5>
              <p><strong>Address:</strong> {assign.report.address}</p>
              <div className="mb-2">
                <StatusBadge status={assign.status} /> <span className={`badge bg-${assign.report.severity === 'CRITICAL' ? 'danger' : 'secondary'}`}>Severity: {assign.report.severity}</span>
              </div>
              
              {assign.status === 'PENDING' && (
                <div className="mt-3">
                  <button className="btn btn-success me-2" onClick={() => handleAccept(assign.id)}>✅ Accept</button>
                  <button className="btn btn-danger" onClick={() => handleReject(assign.id)}>❌ Reject</button>
                </div>
              )}
              
              {assign.status === 'ACCEPTED' && assign.report.status !== 'IN_PROGRESS' && (
                <div className="mt-3">
                  <button className="btn btn-primary" onClick={() => handleMarkInProgress(assign.report.id)}>🔧 Mark In Progress</button>
                </div>
              )}

              {assign.status === 'ACCEPTED' && assign.report.status === 'IN_PROGRESS' && (
                <div className="mt-3 border-top pt-3">
                  <h6>Mark as Resolved</h6>
                  <form onSubmit={(e) => handleResolve(assign.report.id, e)}>
                    <div className="mb-2">
                      <label className="form-label small">Proof Photo</label>
                      <input type="file" name="photo" className="form-control form-control-sm" required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">Remarks</label>
                      <input type="text" name="remarks" className="form-control form-control-sm" required />
                    </div>
                    <button type="submit" className="btn btn-success btn-sm">✔️ Submit Resolution</button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
        {assignments.length === 0 && <p>No assignments found.</p>}
      </div>
    </div>
  );
};

export default WorkerPortal;
