import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard().then(res => setStats(res.data)).catch(console.error);
    api.getPriorityQueue().then(res => setReports(res.data)).catch(console.error);
    api.getAllUsers().then(res => {
      setUsers(res.data);
      setWorkers(res.data.filter(u => u.role === 'WORKER'));
    }).catch(console.error);
  }, []);

  const handleAssign = async (reportId, workerId) => {
    try {
      await api.assignWorker(reportId, { workerId });
      api.getPriorityQueue().then(res => setReports(res.data)).catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete report?")) {
      try {
        await api.deleteReport(id);
        api.getPriorityQueue().then(res => setReports(res.data)).catch(console.error);
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

  if (!stats) return <div>Loading...</div>;

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
            <h3 className="text-secondary">{stats.pending}</h3>
          </div>
        </div>
        <div className="col-md-2 col-6 mb-3">
          <div className="card p-3 text-center">
            <h6>In Progress</h6>
            <h3 className="text-info">{stats.inProgress}</h3>
          </div>
        </div>
        <div className="col-md-2 col-6 mb-3">
          <div className="card p-3 text-center">
            <h6>Resolved</h6>
            <h3 className="text-success">{stats.resolved}</h3>
          </div>
        </div>
        <div className="col-md-4 col-12 mb-3">
          <div className="card p-3 text-center">
            <h6>Resolution Rate</h6>
            <h3 className="text-warning">
               {stats.totalReports > 0 ? Math.round((stats.resolved / stats.totalReports) * 100) : 0}%
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
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="fw-bold">{r.priorityScore}</div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div className={`progress-bar bg-${r.priorityScore > 70 ? 'danger' : r.priorityScore > 40 ? 'warning' : 'success'}`} style={{ width: `${r.priorityScore}%` }}></div>
                      </div>
                    </td>
                    <td style={{ cursor: 'pointer', color: 'blue' }} onClick={() => navigate(`/reports/${r.id}`)}>{r.title}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.severity}</td>
                    <td>
                      {(r.status === 'REPORTED' || r.status === 'VERIFIED') && (
                        <div className="input-group input-group-sm mb-1">
                          <select className="form-select" id={`worker-${r.id}`}>
                            <option value="">Select Worker</option>
                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                          <button className="btn btn-outline-primary" onClick={() => {
                            const wId = document.getElementById(`worker-${r.id}`).value;
                            if(wId) handleAssign(r.id, wId);
                          }}>Assign</button>
                        </div>
                      )}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="tab-pane fade" id="users">
          <div className="card p-3">
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
