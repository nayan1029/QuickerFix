import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [queue, setQueue] = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [categories, setCategories] = useState([]);
  const [queueFilters, setQueueFilters] = useState({ query: '', status: '', categoryId: '' });
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [dashboardError, setDashboardError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '', departmentId: '' });
  const [workerError, setWorkerError] = useState('');
  const [workerSuccess, setWorkerSuccess] = useState('');
  const [creatingWorker, setCreatingWorker] = useState(false);
  const [activePanel, setActivePanel] = useState('priority');
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const initialFrom = new Date(Date.now() - 89 * 86400000).toISOString().slice(0, 10);
  const [analyticsFilters, setAnalyticsFilters] = useState({ from: initialFrom, to: today, categoryId: '' });
  const [triageById, setTriageById] = useState({});
  const [triageBusyId, setTriageBusyId] = useState(null);
  const navigate = useNavigate();

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await api.getAllUsers();
      const list = response.data || [];
      setUsers(list);
      setWorkers(list.filter(user => user.role === 'WORKER'));
    } catch (error) {
      setUsersError(error.response?.data?.message || 'User accounts could not be loaded.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadQueue = useCallback(async (page = 0, filters = { query: '', status: '', categoryId: '' }) => {
    setQueueLoading(true);
    setQueueError('');
    try {
      const response = await api.getPriorityQueue({ ...filters, page, size: 10 });
      const result = response.data || {};
      setQueue(result);
      setReports(result.content || []);
    } catch (error) {
      setQueueError(error.response?.data?.message || 'The report queue could not be loaded.');
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async (filters = analyticsFilters) => {
    setAnalyticsLoading(true); setAnalyticsError('');
    try { const response = await api.getAdminAnalytics(filters); setAnalytics(response.data); }
    catch (error) { setAnalyticsError(error.response?.data?.message || 'Analytics could not be loaded.'); }
    finally { setAnalyticsLoading(false); }
  }, [analyticsFilters]);

  useEffect(() => {
    api.getDashboard().then(res => setStats(res.data)).catch(error => setDashboardError(error.response?.data?.message || 'Dashboard data could not be loaded.'));
    loadQueue();
    loadAnalytics();
    api.getCategories().then(res => setCategories(res.data || [])).catch(() => setCategories([]));
    api.getDepartments().then(res => setDepartments(res.data || [])).catch(console.error);
    loadUsers();
  }, [loadQueue, loadUsers, loadAnalytics]);

  const handleAssign = async (reportId, workerId) => {
    try {
      await api.assignWorker(reportId, { workerId });
      loadQueue(queue.number, queueFilters);
    } catch (err) {
      setQueueError(err.response?.data?.message || 'The worker could not be assigned.');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete report?")) {
      try {
        await api.deleteReport(id);
        loadQueue(queue.number, queueFilters);
      } catch (err) {
        setQueueError(err.response?.data?.message || 'The report could not be deleted.');
      }
    }
  };

  const handleToggleUser = async (id) => {
    setTogglingUserId(id);
    setUsersError('');
    try {
      await api.toggleUser(id);
      await loadUsers();
    } catch (error) {
      setUsersError(error.response?.data?.message || 'The account status could not be changed.');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleCreateWorker = async (event) => {
    event.preventDefault();
    setCreatingWorker(true);
    setWorkerError('');
      setWorkerSuccess('');
    try {
      await api.createWorker({ ...workerForm, departmentId: Number(workerForm.departmentId) });
      setWorkerForm({ name: '', email: '', password: '', departmentId: '' });
      await loadUsers();
      setWorkerSuccess('Worker account created successfully.');
    } catch (error) {
      setWorkerError(error.response?.data?.message || 'Could not create the worker account.');
    } finally {
      setCreatingWorker(false);
    }
  };

  const handleReviewTransition = async (reportId, newStatus) => {
    try {
      await api.updateStatus(reportId, { newStatus });
      await loadQueue(queue.number, queueFilters);
    } catch (error) {
      setQueueError(error.response?.data?.message || 'The report status could not be updated.');
    }
  };

  const handleGetTriage = async (reportId) => {
    setTriageBusyId(reportId);
    try {
      const response = await api.getTriageSuggestion(reportId);
      setTriageById(current => ({ ...current, [reportId]: { ...response.data, chosenCategoryId: String(response.data.categoryId), chosenSeverity: response.data.severity, note: '' } }));
    } catch (error) {
      setQueueError(error.response?.data?.message || 'AI triage could not be generated.');
    } finally { setTriageBusyId(null); }
  };

  const handleTriageEdit = (reportId, field, value) => setTriageById(current => ({ ...current, [reportId]: { ...current[reportId], [field]: value } }));

  const handleTriageApply = async (reportId) => {
    const triage = triageById[reportId];
    setTriageBusyId(reportId);
    try {
      await api.reviewTriage(reportId, { categoryId: Number(triage.chosenCategoryId), severity: triage.chosenSeverity, note: triage.note });
      setTriageById(current => { const next = { ...current }; delete next[reportId]; return next; });
      await loadQueue(queue.number, queueFilters);
    } catch (error) { setQueueError(error.response?.data?.message || 'The triage decision could not be saved.'); }
    finally { setTriageBusyId(null); }
  };

  if (!stats) return <div className="container py-5">{dashboardError ? <div className="alert alert-danger" role="alert">{dashboardError} <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => api.getDashboard().then(res => { setStats(res.data); setDashboardError(''); }).catch(() => setDashboardError('Dashboard data could not be loaded.'))}>Retry</button></div> : <p role="status">Loading dashboard…</p>}</div>;

  return (
    <div className="container mt-4">
      <h2>Admin Command Center</h2>
      <div className="row mt-4 mb-5">
        <div className="col-md-2 col-6 mb-3">
          <div className="card p-3 text-center">
            <h6>Total Reports</h6>
            <h3 className="text-primary">{stats.totalReports}</h3>
          </div>
        </div>
        <div className="col-md-2 col-6 mb-3">
          <div className="card p-3 text-center">
            <h6>Pending</h6>
            <h3 className="text-secondary">{stats.pendingReports}</h3>
          </div>
        </div>
        <div className="col-md-2 col-6 mb-3">
          <div className="card p-3 text-center">
            <h6>In Progress</h6>
            <h3 className="text-info">{stats.inProgressReports}</h3>
          </div>
        </div>
        <div className="col-md-2 col-6 mb-3">
          <div className="card p-3 text-center">
            <h6>Resolved</h6>
            <h3 className="text-success">{stats.resolvedReports}</h3>
          </div>
        </div>
        <div className="col-md-4 col-12 mb-3">
          <div className="card p-3 text-center">
            <h6>Resolution Rate</h6>
            <h3 className="text-warning">
               {stats.totalReports > 0 ? Math.round(stats.resolutionRate || 0) : 0}%
            </h3>
          </div>
        </div>
      </div>

      <section className="card p-3 mb-4" aria-labelledby="analytics-title">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3"><div><h3 id="analytics-title" className="h5 mb-1">Report analytics</h3><p className="small text-muted mb-0">Database totals for the selected reporting dates. Resolution percentiles use up to 1,000 most recently closed reports.</p></div>
          <form className="d-flex flex-wrap align-items-end gap-2" onSubmit={event => { event.preventDefault(); loadAnalytics(analyticsFilters); }}>
            <div><label className="form-label small mb-1" htmlFor="analytics-from">From</label><input id="analytics-from" className="form-control form-control-sm" type="date" required value={analyticsFilters.from} onChange={e => setAnalyticsFilters({ ...analyticsFilters, from: e.target.value })} /></div>
            <div><label className="form-label small mb-1" htmlFor="analytics-to">To</label><input id="analytics-to" className="form-control form-control-sm" type="date" required value={analyticsFilters.to} onChange={e => setAnalyticsFilters({ ...analyticsFilters, to: e.target.value })} /></div>
            <div><label className="form-label small mb-1" htmlFor="analytics-category">Category</label><select id="analytics-category" className="form-select form-select-sm" value={analyticsFilters.categoryId} onChange={e => setAnalyticsFilters({ ...analyticsFilters, categoryId: e.target.value })}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
            <button type="submit" className="btn btn-sm btn-outline-primary" disabled={analyticsLoading}>Apply</button>
          </form>
        </div>
        {analyticsError && <div className="alert alert-danger mt-3" role="alert">{analyticsError} <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => loadAnalytics()}>Retry</button></div>}
        {analyticsLoading ? <p className="py-3 text-center mb-0" role="status">Loading report analytics…</p> : analytics && <>
          {analytics.lowSample && <p className="alert alert-info mt-3 mb-2">Small sample: {analytics.totalReports} reports in this date window. Treat rates and percentiles as directional.</p>}
          <div className="row g-3 mt-1">
            <div className="col-sm-6 col-lg-3"><div className="border rounded p-3 h-100"><div className="small text-muted">Reports in window</div><strong className="fs-4">{analytics.totalReports}</strong><div className="small">{analytics.from} to {analytics.to}</div></div></div>
            <div className="col-sm-6 col-lg-3"><div className="border rounded p-3 h-100"><div className="small text-muted">Closed reports</div><strong className="fs-4">{analytics.closedReports}</strong><div className="small">Same submitted-date window</div></div></div>
            <div className="col-sm-6 col-lg-3"><div className="border rounded p-3 h-100"><div className="small text-muted">Median resolution time</div><strong className="fs-4">{analytics.medianResolutionHours == null ? '—' : `${analytics.medianResolutionHours} h`}</strong><div className="small">From {analytics.resolutionSampleSize} closed reports</div></div></div>
            <div className="col-sm-6 col-lg-3"><div className="border rounded p-3 h-100"><div className="small text-muted">90th percentile</div><strong className="fs-4">{analytics.p90ResolutionHours == null ? '—' : `${analytics.p90ResolutionHours} h`}</strong><div className="small">{analytics.resolutionSampleCapped ? 'Sample capped at 1,000; recent closures' : 'All matching closed reports'}</div></div></div>
          </div>
          <div className="row mt-3"><div className="col-md-6"><h4 className="h6">Backlog age (active reports)</h4>{Object.entries(analytics.backlogAgeBuckets || {}).map(([label, count]) => <div key={label} className="d-flex justify-content-between border-bottom py-2"><span>{label}</span><strong>{count}</strong></div>)}</div>
            <div className="col-md-6"><h4 className="h6">Reports by status</h4>{Object.entries(analytics.reportsByStatus || {}).filter(([,count]) => count > 0).map(([label,count]) => <div key={label} className="d-flex justify-content-between border-bottom py-2"><span>{label.replaceAll('_',' ')}</span><strong>{count}</strong></div>)}<h4 className="h6 mt-3">Reports by category</h4>{Object.entries(analytics.reportsByCategory || {}).length ? Object.entries(analytics.reportsByCategory).map(([label,count]) => <div key={label} className="d-flex justify-content-between border-bottom py-2"><span>{label}</span><strong>{count}</strong></div>) : <p className="small text-muted">No reports in these categories for this date window.</p>}</div>
          </div>
        </>}
      </section>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button type="button" role="tab" aria-selected={activePanel === 'priority'} className={`nav-link ${activePanel === 'priority' ? 'active' : ''}`} onClick={() => setActivePanel('priority')}>High Priority Queue</button>
        </li>
        <li className="nav-item">
          <button type="button" role="tab" aria-selected={activePanel === 'users'} className={`nav-link ${activePanel === 'users' ? 'active' : ''}`} onClick={() => setActivePanel('users')}>User Management</button>
        </li>
      </ul>

      <div className="tab-content">
        {activePanel === 'priority' && <div className="tab-pane show active" role="tabpanel" aria-label="Priority queue">
          <div className="card p-3">
            <form className="row g-2 mb-3" onSubmit={event => { event.preventDefault(); loadQueue(0, queueFilters); }}>
              <div className="col-md-4"><label className="form-label" htmlFor="admin-report-search">Search</label><input id="admin-report-search" className="form-control" placeholder="Title or address" value={queueFilters.query} onChange={event => setQueueFilters({ ...queueFilters, query: event.target.value })} /></div>
              <div className="col-md-3"><label className="form-label" htmlFor="admin-report-status">Status</label><select id="admin-report-status" className="form-select" value={queueFilters.status} onChange={event => setQueueFilters({ ...queueFilters, status: event.target.value })}><option value="">All active statuses</option>{['REPORTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'CITIZEN_VERIFICATION', 'REOPENED'].map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></div>
              <div className="col-md-3"><label className="form-label" htmlFor="admin-report-category">Category</label><select id="admin-report-category" className="form-select" value={queueFilters.categoryId} onChange={event => setQueueFilters({ ...queueFilters, categoryId: event.target.value })}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <div className="col-md-2 d-flex align-items-end"><button className="btn btn-primary w-100" type="submit" disabled={queueLoading}>Apply filters</button></div>
            </form>
            {queueError && <div className="alert alert-danger" role="alert">{queueError} <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => loadQueue(queue.number, queueFilters)}>Retry</button></div>}
            {queueLoading && <div className="py-3 text-center" role="status">Loading reports…</div>}
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!queueLoading && reports.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No reports match these filters.</td></tr>}
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-bold">{r.priorityScore}</div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div className={`progress-bar bg-${r.priorityScore > 70 ? 'danger' : r.priorityScore > 40 ? 'warning' : 'success'}`} style={{ width: `${r.priorityScore}%` }}></div>
                      </div>
                    </td>
                    <td style={{ cursor: 'pointer', color: 'blue' }} onClick={() => navigate(`/reports/${r.id}`)}>{r.title}</td>
                    <td>{r.categoryName}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.severity}</td>
                    <td>
                      {(r.status === 'REPORTED' || r.status === 'UNDER_REVIEW') && <div className="mb-2">
                        {!triageById[r.id] && <button type="button" className="btn btn-sm btn-outline-info" disabled={triageBusyId === r.id} onClick={() => handleGetTriage(r.id)}>{triageBusyId === r.id ? 'Analyzing…' : 'AI triage'}</button>}
                        {triageById[r.id] && <div className="border rounded p-2 mt-2" style={{ minWidth: 250 }}>
                          <div className="small mb-2"><strong>Local model suggestion</strong><br />{triageById[r.id].rationale}<br />Confidence: {Math.round(triageById[r.id].confidence * 100)}%{triageById[r.id].reviewRequired && <span className="badge bg-warning text-dark ms-2">Review carefully</span>}</div>
                          <label className="form-label small" htmlFor={`triage-category-${r.id}`}>Category</label>
                          <select id={`triage-category-${r.id}`} className="form-select form-select-sm mb-2" value={triageById[r.id].chosenCategoryId} onChange={event => handleTriageEdit(r.id, 'chosenCategoryId', event.target.value)}>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                          <label className="form-label small" htmlFor={`triage-severity-${r.id}`}>Severity</label>
                          <select id={`triage-severity-${r.id}`} className="form-select form-select-sm mb-2" value={triageById[r.id].chosenSeverity} onChange={event => handleTriageEdit(r.id, 'chosenSeverity', event.target.value)}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(value => <option key={value}>{value}</option>)}</select>
                          <label className="form-label small" htmlFor={`triage-note-${r.id}`}>Review note (optional)</label>
                          <input id={`triage-note-${r.id}`} className="form-control form-control-sm mb-2" maxLength="500" value={triageById[r.id].note} onChange={event => handleTriageEdit(r.id, 'note', event.target.value)} />
                          <button type="button" className="btn btn-sm btn-success me-1" disabled={triageBusyId === r.id} onClick={() => handleTriageApply(r.id)}>Apply reviewed values</button>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setTriageById(current => { const next = { ...current }; delete next[r.id]; return next; })}>Cancel</button>
                        </div>}
                      </div>}
                      {r.status === 'REPORTED' && <button className="btn btn-sm btn-outline-primary" onClick={() => handleReviewTransition(r.id, 'UNDER_REVIEW')}>Start review</button>}
                      {r.status === 'UNDER_REVIEW' && <button className="btn btn-sm btn-outline-success" onClick={() => handleReviewTransition(r.id, 'VERIFIED')}>Verify report</button>}
                      {r.status === 'VERIFIED' && (
                        <div className="input-group input-group-sm mb-1">
                          <select className="form-select" id={`worker-${r.id}`}>
                            <option value="">Select Worker</option>
                            {workers.filter(worker => worker.departmentId === r.categoryDepartmentId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                          <button className="btn btn-outline-primary" onClick={() => {
                            const wId = document.getElementById(`worker-${r.id}`).value;
                            if(wId) handleAssign(r.id, wId);
                          }}>Assign</button>
                        </div>
                      )}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="d-flex justify-content-between align-items-center"><button className="btn btn-sm btn-outline-secondary" disabled={queueLoading || queue.number <= 0} onClick={() => loadQueue(queue.number - 1, queueFilters)}>Previous</button><span className="small text-muted">{queue.totalElements || 0} reports · Page {queue.totalPages ? queue.number + 1 : 0} of {queue.totalPages || 0}</span><button className="btn btn-sm btn-outline-secondary" disabled={queueLoading || queue.number + 1 >= (queue.totalPages || 0)} onClick={() => loadQueue(queue.number + 1, queueFilters)}>Next</button></div>
          </div>
        </div>}
        
        {activePanel === 'users' && <div className="tab-pane show active" role="tabpanel" aria-label="User management">
          <div className="card p-3">
            <h5>Create a field worker account</h5>
            {workerError && <div className="alert alert-danger" role="alert">{workerError}</div>}
            {workerSuccess && <div className="alert alert-success" role="status">{workerSuccess}</div>}
            {usersError && <div className="alert alert-danger" role="alert">{usersError} <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={loadUsers}>Retry</button></div>}
            <form className="row g-3 mb-4" onSubmit={handleCreateWorker}>
              <div className="col-md-3"><label className="form-label" htmlFor="worker-name">Name</label><input id="worker-name" className="form-control" value={workerForm.name} onChange={event => setWorkerForm({ ...workerForm, name: event.target.value })} required maxLength="120" /></div>
              <div className="col-md-3"><label className="form-label" htmlFor="worker-email">Email</label><input id="worker-email" type="email" className="form-control" value={workerForm.email} onChange={event => setWorkerForm({ ...workerForm, email: event.target.value })} required /></div>
              <div className="col-md-3"><label className="form-label" htmlFor="worker-password">Temporary password</label><input id="worker-password" type="password" className="form-control" value={workerForm.password} onChange={event => setWorkerForm({ ...workerForm, password: event.target.value })} required minLength="12" maxLength="72" autoComplete="new-password" /></div>
              <div className="col-md-3"><label className="form-label" htmlFor="worker-department">Department</label><select id="worker-department" className="form-select" value={workerForm.departmentId} onChange={event => setWorkerForm({ ...workerForm, departmentId: event.target.value })} required><option value="">Select department</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}</select></div>
              <div className="col-12"><button className="btn btn-primary" type="submit" disabled={creatingWorker}>{creatingWorker ? 'Creating…' : 'Create worker account'}</button></div>
            </form>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading && <tr><td colSpan="5" className="text-center" role="status">Loading accounts…</td></tr>}
                {!usersLoading && !usersError && users.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No accounts have been created.</td></tr>}
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge bg-secondary">{u.role}</span></td>
                    <td>{u.enabled ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Disabled</span>}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary" disabled={togglingUserId === u.id} onClick={() => handleToggleUser(u.id)}>{togglingUserId === u.id ? 'Saving…' : 'Toggle'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>}
      </div>
    </div>
  );
};

export default AdminDashboard;
