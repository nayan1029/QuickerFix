import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementService } from '../services/announcementService';
import * as api from '../services/api';
import './Announcements.css';

const emptyForm = { title: '', content: '', scope: 'ALL', priority: 'MEDIUM', targetDistrictId: '', targetCategoryId: '', expiresAt: '' };

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterScope, setFilterScope] = useState('ALL');
  const [filterTarget, setFilterTarget] = useState('');

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await announcementService.getAnnouncements(filterScope, 0, filterTarget || null);
      setAnnouncements(response.data || []);
      if (user) {
        const unreadResponse = await announcementService.getUnreadCount();
        setUnreadCount(unreadResponse.count || 0);
      }
      setError('');
    } catch (requestError) {
      setError('Announcements could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, filterScope, filterTarget]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);
  useEffect(() => {
    api.getCategories().then(response => setCategories(response.data || [])).catch(() => {});
  }, []);

  const publish = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        ...form,
        targetDistrictId: form.scope === 'DISTRICT' && form.targetDistrictId ? Number(form.targetDistrictId) : null,
        targetCategoryId: form.scope === 'CATEGORY' && form.targetCategoryId ? Number(form.targetCategoryId) : null,
        expiresAt: form.expiresAt || null
      };
      await announcementService.createAnnouncement(body);
      setForm(emptyForm);
      setSuccess('Announcement published.');
      await loadAnnouncements();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Announcement could not be published.');
    } finally {
      setSaving(false);
    }
  };

  const markRead = async (id) => {
    try {
      await announcementService.markAsRead(id);
      setAnnouncements(current => current.map(item => item.id === id ? { ...item, isRead: true } : item));
      setUnreadCount(current => Math.max(0, current - 1));
    } catch (requestError) {
      setError('Could not update the read status. Please try again.');
    }
  };

  const withdraw = async id => {
    if (!window.confirm('Withdraw this announcement from the public noticeboard?')) return;
    setError(''); setSuccess('');
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements(items => items.filter(item => item.id !== id));
      setSuccess('Announcement withdrawn.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Announcement could not be withdrawn.');
    }
  };

  return <main className="container py-4 announcements-container">
    <header className="mb-4"><span className="eyebrow text-primary bg-white border">Official updates</span><h1 className="mt-3">Community noticeboard</h1><p className="text-muted">Announcements and service updates published by local authorities.</p></header>
    {error && <div className="alert alert-danger" role="alert">{error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={loadAnnouncements}>Retry</button></div>}
    {success && <div className="alert alert-success" role="status">{success}</div>}

    {user?.role === 'ADMIN' && <section className="card p-4 mb-4">
      <h2 className="h4">Publish an announcement</h2>
      <form className="row g-3" onSubmit={publish}>
        <div className="col-12"><label className="form-label" htmlFor="notice-title">Title</label><input id="notice-title" className="form-control" maxLength="255" required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></div>
        <div className="col-12"><label className="form-label" htmlFor="notice-content">Message</label><textarea id="notice-content" className="form-control" rows="4" maxLength="5000" required value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} /></div>
        <div className="col-md-4"><label className="form-label" htmlFor="notice-scope">Audience</label><select id="notice-scope" className="form-select" value={form.scope} onChange={event => setForm({ ...form, scope: event.target.value, targetCategoryId: '', targetDistrictId: '' })}><option value="ALL">Everyone</option><option value="CATEGORY">A service category</option><option value="DISTRICT">A district</option></select></div>
        {form.scope === 'CATEGORY' && <div className="col-md-4"><label className="form-label" htmlFor="notice-category">Category</label><select id="notice-category" className="form-select" required value={form.targetCategoryId} onChange={event => setForm({ ...form, targetCategoryId: event.target.value })}><option value="">Select category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>}
        {form.scope === 'DISTRICT' && <div className="col-md-4"><label className="form-label" htmlFor="notice-district">District ID</label><input id="notice-district" type="number" min="1" className="form-control" required value={form.targetDistrictId} onChange={event => setForm({ ...form, targetDistrictId: event.target.value })} /><small className="text-muted">Use the district ID configured by your authority.</small></div>}
        <div className="col-md-4"><label className="form-label" htmlFor="notice-priority">Priority</label><select id="notice-priority" className="form-select" value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Standard</option><option value="HIGH">Urgent</option></select></div>
        <div className="col-md-4"><label className="form-label" htmlFor="notice-expires">Optional expiry</label><input id="notice-expires" type="datetime-local" className="form-control" value={form.expiresAt} onChange={event => setForm({ ...form, expiresAt: event.target.value })} /></div>
        <div className="col-12"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish notice'}</button></div>
      </form>
    </section>}

    <section aria-live="polite">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3"><h2 className="h4 mb-0">Current notices</h2><div className="d-flex align-items-center gap-2">{filterScope !== 'ALL' && <select className="form-select form-select-sm" aria-label="Announcement target" value={filterTarget} onChange={event => setFilterTarget(event.target.value)}><option value="">Choose target</option>{filterScope === 'CATEGORY' ? categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>) : null}</select>}{filterScope === 'DISTRICT' && <input className="form-control form-control-sm" aria-label="District ID" type="number" min="1" placeholder="District ID" value={filterTarget} onChange={event => setFilterTarget(event.target.value)} />}{user && unreadCount > 0 && <span className="badge bg-primary">{unreadCount} unread</span>}<button className="btn btn-sm btn-outline-secondary" onClick={loadAnnouncements} disabled={loading}>Refresh</button></div></div>
      <div className="mb-3"><label className="visually-hidden" htmlFor="notice-filter">Filter notices</label><select id="notice-filter" className="form-select" style={{ maxWidth: 260 }} value={filterScope} onChange={event => { setFilterScope(event.target.value); setFilterTarget(''); }}><option value="ALL">All residents</option><option value="CATEGORY">By service category</option><option value="DISTRICT">By district</option></select></div>
      {loading ? <p role="status">Loading notices…</p> : announcements.length === 0 ? <div className="empty-state"><h3 className="h5">No current announcements</h3><p>New authority notices will appear here.</p></div> : <div className="announcements-list">{announcements.map(announcement => <article className={`card announcement-card ${!announcement.isRead && user ? 'unread' : ''} ${announcement.priority === 'HIGH' ? 'notice-urgent' : ''}`} key={announcement.id}>
        <button className="card-header text-start w-100" aria-expanded={expandedId === announcement.id} onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}><span className="d-flex justify-content-between align-items-center gap-3"><span><strong>{announcement.title}</strong><small className="d-block text-muted">{announcement.scope === 'ALL' ? 'All residents' : announcement.scope === 'CATEGORY' ? 'Service category' : 'District'} · {new Date(announcement.createdAt).toLocaleString()}</small></span><span className={`badge ${announcement.priority === 'HIGH' ? 'bg-danger' : announcement.priority === 'MEDIUM' ? 'bg-warning' : 'bg-info'}`}>{announcement.priority}</span></span></button>
        {expandedId === announcement.id && <div className="card-body"><p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{announcement.content}</p><div className="d-flex flex-wrap justify-content-between align-items-center gap-2"><small className="text-muted">{announcement.expiresAt ? `Expires ${new Date(announcement.expiresAt).toLocaleString()}` : 'No expiry set'}</small><div className="d-flex gap-2">{user && !announcement.isRead && <button className="btn btn-sm btn-outline-primary" onClick={() => markRead(announcement.id)}>Mark as read</button>}{user?.role === 'ADMIN' && <button className="btn btn-sm btn-outline-danger" onClick={() => withdraw(announcement.id)}>Withdraw</button>}</div></div></div>}
      </article>)}</div>}
    </section>
  </main>;
};

export default Announcements;
