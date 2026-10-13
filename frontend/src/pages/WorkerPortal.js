import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const WorkerPortal = () => {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, inProgressCount: 0, resolvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState(null);
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const [assignmentResponse, statsResponse] = await Promise.all([api.getMyAssignments(), api.getWorkerStats()]);
      setAssignments(assignmentResponse.data || []);
      setStats(statsResponse.data || { pendingCount: 0, inProgressCount: 0, resolvedCount: 0 });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Your work queue could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const runAssignmentAction = async (id, action, message) => {
    setActionId(id); setError(''); setSuccess('');
    try {
      await action();
      setSuccess(message);
      await fetchAssignments();
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The assignment could not be updated.');
      return false;
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async id => {
    const reason = window.prompt('Why are you unable to take this assignment?');
    if (!reason?.trim()) return;
    await runAssignmentAction(id, () => api.rejectAssignment(id, { reason: reason.trim() }), 'Assignment declined and returned to the verified queue.');
  };

  const handleResolve = async (reportId, event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const submitted = await runAssignmentAction(reportId, () => api.resolveReport(reportId, data), 'Completion evidence submitted for citizen review.');
    if (submitted) form.reset();
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div><span className="eyebrow text-primary bg-white border">Field team</span><h1 className="mt-3 mb-1">Worker dashboard</h1><p className="text-muted mb-0">Review assignments, record completed work, and send evidence to the resident.</p></div>
        <button className="btn btn-outline-secondary" onClick={fetchAssignments} disabled={loading}>Refresh queue</button>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={fetchAssignments}>Retry</button></div>}
      {success && <div className="alert alert-success" role="status">{success}</div>}

      <div className="row g-3 mb-5">
        {[["Awaiting response", stats.pendingCount], ["In progress", stats.inProgressCount], ["Completed", stats.resolvedCount]].map(([label, value]) => <div className="col-md-4" key={label}><div className="card p-3 h-100"><span className="small text-muted">{label}</span><strong className="display-6">{value}</strong></div></div>)}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h4 mb-0">My assignments</h2><span className="small text-muted">{assignments.length} shown</span></div>
      <div className="row g-3" aria-live="polite">
        {loading && <div className="col-12 py-5 text-center" role="status">Loading your assignments…</div>}
        {!loading && !error && assignments.map(assignment => <div key={assignment.id} className="col-lg-6">
          <article className="card p-4 h-100">
            <button type="button" className="btn btn-link text-start text-decoration-none p-0" onClick={() => navigate(`/reports/${assignment.report.id}`)}><h3 className="h5 mb-1">{assignment.report.title}</h3></button>
            <p className="text-muted mb-3">{assignment.report.address || 'Location not provided'}</p>
            <div className="d-flex flex-wrap gap-2 mb-3"><StatusBadge status={assignment.report.status} /><span className="badge bg-secondary">{assignment.report.severity}</span><span className="badge bg-light text-dark border">{assignment.report.categoryName}</span></div>

            {assignment.status === 'PENDING' && <div className="mt-auto"><p className="small text-muted">Review the location and work details before accepting this assignment.</p><button className="btn btn-success me-2" disabled={actionId === assignment.id} onClick={() => runAssignmentAction(assignment.id, () => api.acceptAssignment(assignment.id), 'Assignment accepted and work started.')}>Accept assignment</button><button className="btn btn-outline-danger" disabled={actionId === assignment.id} onClick={() => handleReject(assignment.id)}>Decline</button></div>}

            {assignment.status === 'ACCEPTED' && assignment.report.status === 'IN_PROGRESS' && <div className="border-top pt-3 mt-auto"><h4 className="h6">Submit completed work</h4><form onSubmit={event => handleResolve(assignment.report.id, event)}>
              <div className="mb-2"><label className="form-label small" htmlFor={`proof-${assignment.id}`}>Completion photo</label><input id={`proof-${assignment.id}`} type="file" name="photo" accept="image/jpeg,image/png,image/gif,image/webp" className="form-control form-control-sm" required /></div>
              <div className="mb-3"><label className="form-label small" htmlFor={`remarks-${assignment.id}`}>Work completed</label><input id={`remarks-${assignment.id}`} type="text" name="remarks" className="form-control form-control-sm" maxLength="500" required /></div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={actionId === assignment.report.id}>{actionId === assignment.report.id ? 'Submitting…' : 'Send for citizen review'}</button>
            </form></div>}
            {assignment.status === 'COMPLETED' && <p className="small text-success mb-0 mt-auto">Your evidence is with the resident for verification.</p>}
          </article>
        </div>)}
        {!loading && !error && assignments.length === 0 && <div className="col-12"><div className="empty-state"><h3 className="h6">No active assignments</h3><p className="mb-0">New assignments from your department will appear here.</p></div></div>}
      </div>
    </div>
  );
};

export default WorkerPortal;
