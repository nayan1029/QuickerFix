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
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '', departmentId: '' });
  const [workerError, setWorkerError] = useState('');
  const [workerSuccess, setWorkerSuccess] = useState('');
  const [creatingWorker, setCreatingWorker] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    api.getDashboard().then(res => setStats(res.data)).catch(error => setDashboardError(error.response?.data?.message || 'Dashboard data could not be loaded.'));
    loadQueue();
    api.getCategories().then(res => setCategories(res.data || [])).catch(() => setCategories([]));
    api.getDepartments().then(res => setDepartments(res.data || [])).catch(console.error);
    api.getAllUsers().then(res => {
      setUsers(res.data);
      setWorkers(res.data.filter(u => u.role === 'WORKER'));
    }).catch(console.error);
  }, [loadQueue]);

  const handleAssign = async (reportId, workerId) => {
    try {
      await api.assignWorker(reportId, { workerId });
      loadQueue(queue.number, queueFilters);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete report?")) {
      try {
        await api.deleteReport(id);
        loadQueue(queue.number, queueFilters);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await api.toggleUser(id);
      api.getAllUsers().then(res => {
        setUsers(res.data);
        setWorkers(res.data.filter(u => u.role === 'WORKER'));
      }).catch(console.error);
    } catch (err) {
      console.error(err);
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
      const response = await api.getAllUsers();
      setUsers(response.data);
      setWorkers(response.data.filter(user => user.role === 'WORKER'));
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
      window.alert(error.response?.data?.message || 'The report status could not be updated.');
    }
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

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <a className="nav-link active" data-bs-toggle="tab" href="#priority">High Priority Queue</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-bs-toggle="tab" href="#users">User Management</a>
        </li>
      </ul>

      <div className="tab-content">
        <div className="tab-pane fade show active" id="priority">
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
        </div>
        
        <div className="tab-pane fade" id="users">
          <div className="card p-3">
            <h5>Create a field worker account</h5>
            {workerError && <div className="alert alert-danger" role="alert">{workerError}</div>}
            {workerSuccess && <div className="alert alert-success" role="status">{workerSuccess}</div>}
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
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge bg-secondary">{u.role}</span></td>
                    <td>{u.enabled ? <span className="badge bg-success">Active</span> : <span className="badge bg-danger">Disabled</span>}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => handleToggleUser(u.id)}>Toggle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
