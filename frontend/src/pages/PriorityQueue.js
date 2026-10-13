import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const PriorityQueue = () => {
  const [queue, setQueue] = useState({ content: [], number: 0, totalPages: 0, totalElements: 0 });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ query: '', status: '', categoryId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadQueue = useCallback(async (page = 0, nextFilters = { query: '', status: '', categoryId: '' }) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getPriorityQueue({ ...nextFilters, page, size: 10 });
      setQueue(response.data || { content: [], number: 0, totalPages: 0, totalElements: 0 });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The priority queue could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getCategories().then(response => setCategories(response.data || [])).catch(() => setCategories([]));
    loadQueue();
  }, [loadQueue]);

  const applyFilters = event => {
    event.preventDefault();
    loadQueue(0, filters);
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <span className="eyebrow text-primary bg-white border">Operations</span>
        <h1 className="mt-3">Priority queue</h1>
        <p className="text-muted">Review active reports in priority order and narrow the queue by status, category, or location text.</p>
      </div>

      <form className="card p-3 mb-4" onSubmit={applyFilters}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5"><label className="form-label" htmlFor="queue-query">Search reports</label><input id="queue-query" className="form-control" value={filters.query} onChange={event => setFilters({ ...filters, query: event.target.value })} placeholder="Title or address" /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="queue-status">Status</label><select id="queue-status" className="form-select" value={filters.status} onChange={event => setFilters({ ...filters, status: event.target.value })}><option value="">All active statuses</option>{['REPORTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'CITIZEN_VERIFICATION', 'REOPENED'].map(status => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></div>
          <div className="col-md-3"><label className="form-label" htmlFor="queue-category">Category</label><select id="queue-category" className="form-select" value={filters.categoryId} onChange={event => setFilters({ ...filters, categoryId: event.target.value })}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div className="col-md-1 d-grid"><button className="btn btn-primary" type="submit" disabled={loading}>Apply</button></div>
        </div>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => loadQueue(queue.number)}>Retry</button></div>}
      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-3"><h2 className="h5 mb-0">Active reports</h2><span className="text-muted">{queue.totalElements} reports</span></div>
        {loading ? <div className="py-5 text-center" role="status">Loading priority queue…</div> : queue.content?.length ? <div className="table-responsive"><table className="table table-hover align-middle">
          <thead><tr><th>Priority</th><th>Report</th><th>Category</th><th>Age</th><th>Status</th></tr></thead>
          <tbody>{queue.content.map((report, index) => <tr key={report.id} tabIndex="0" role="link" onClick={() => navigate(`/reports/${report.id}`)} onKeyDown={event => { if (event.key === 'Enter') navigate(`/reports/${report.id}`); }} style={{ cursor: 'pointer' }}>
            <td><strong>#{queue.number * queue.size + index + 1}</strong><div className="small text-muted">Score {report.priorityScore ?? 0}</div></td>
            <td><strong>{report.title}</strong><div className="small text-muted">{report.address || 'Location not provided'}</div></td><td>{report.categoryName}</td>
            <td>{report.createdAt ? `${Math.max(0, Math.floor((Date.now() - new Date(report.createdAt)) / 86400000))} days` : '—'}</td><td><StatusBadge status={report.status} /></td>
          </tr>)}</tbody>
        </table></div> : <div className="empty-state"><h3 className="h6">No matching reports</h3><p className="mb-0">Try clearing one or more filters.</p></div>}
        <div className="d-flex justify-content-between align-items-center mt-2"><button className="btn btn-outline-secondary btn-sm" disabled={loading || queue.number <= 0} onClick={() => loadQueue(queue.number - 1)}>Previous</button><span className="small text-muted">Page {queue.totalPages ? queue.number + 1 : 0} of {queue.totalPages}</span><button className="btn btn-outline-secondary btn-sm" disabled={loading || queue.number + 1 >= queue.totalPages} onClick={() => loadQueue(queue.number + 1)}>Next</button></div>
      </div>
    </div>
  );
};

export default PriorityQueue;
