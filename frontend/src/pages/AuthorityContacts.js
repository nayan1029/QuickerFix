import React, { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { authorityName: '', serviceType: '', phone: '', alternatePhone: '', email: '', address: '', state: 'Jharkhand', district: '', coverage: 'STATE', instructions: '', officialSourceUrl: '', verifiedAt: new Date().toISOString().slice(0, 10), emergency: false, active: true };

export default function AuthorityContacts() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ state: 'Jharkhand', district: '', serviceType: '' });
  const [contacts, setContacts] = useState([]);
  const [managed, setManaged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await api.getAuthorityContacts(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
      setContacts(result.data || []);
      if (user?.role === 'ADMIN') { const adminResult = await api.getManagedAuthorityContacts(); setManaged(adminResult.data || []); }
    } catch (requestError) { setError(requestError.response?.data?.message || 'The contact list could not be loaded.'); }
    finally { setLoading(false); }
  }, [filters, user]);

  useEffect(() => { load(); }, [load]);

  const edit = contact => {
    setEditingId(contact.id);
    setForm({ ...emptyForm, ...contact, verifiedAt: contact.verifiedAt || '', alternatePhone: contact.alternatePhone || '', email: contact.email || '', address: contact.address || '', district: contact.district || '', instructions: contact.instructions || '', officialSourceUrl: contact.officialSourceUrl || '' });
    setMessage('');
  };
  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      if (editingId) await api.updateAuthorityContact(editingId, form); else await api.createAuthorityContact(form);
      setMessage(editingId ? 'Official contact updated.' : 'Official contact added.'); reset(); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || 'The contact could not be saved.'); }
    finally { setSaving(false); }
  };
  const withdraw = async contact => {
    if (!window.confirm(`Remove ${contact.authorityName} from the public directory?`)) return;
    try { await api.withdrawAuthorityContact(contact.id); setMessage('Contact withdrawn from the public directory.'); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || 'The contact could not be withdrawn.'); }
  };

  return <div className="container py-4">
    <header className="mb-4"><span className="eyebrow text-primary bg-white border">Verified directory</span><h1 className="mt-3">Emergency and authority contacts</h1><p className="text-muted">Official contacts for Jharkhand and India. In an immediate emergency, call <a href="tel:112">112</a>. Check each entry's official source and last verification date.</p></header>
    {error && <div className="alert alert-danger" role="alert">{error} <button className="btn btn-sm btn-outline-danger ms-2" onClick={load}>Retry</button></div>}{message && <div className="alert alert-success" role="status">{message}</div>}
    <form className="card card-body mb-4" onSubmit={event => { event.preventDefault(); load(); }}><div className="row g-3 align-items-end">
      <div className="col-sm-4"><label className="form-label" htmlFor="contact-state">State</label><input id="contact-state" className="form-control" value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} /></div>
      <div className="col-sm-4"><label className="form-label" htmlFor="contact-district">District (optional)</label><input id="contact-district" className="form-control" placeholder="For example, Ranchi" value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })} /></div>
      <div className="col-sm-3"><label className="form-label" htmlFor="contact-type">Service</label><select id="contact-type" className="form-select" value={filters.serviceType} onChange={e => setFilters({ ...filters, serviceType: e.target.value })}><option value="">All services</option>{['GENERAL EMERGENCY','POLICE','MEDICAL','FIRE','WOMEN SAFETY','CHILD SAFETY','DISASTER MANAGEMENT'].map(type => <option key={type}>{type}</option>)}</select></div>
      <div className="col-sm-1 d-grid"><button className="btn btn-primary" disabled={loading}>Find</button></div>
    </div></form>
    {loading ? <p role="status">Loading official contacts…</p> : contacts.length ? <div className="row g-3 mb-5">{contacts.map(contact => <div className="col-md-6 col-xl-4" key={contact.id}><article className={`card h-100 p-3 ${contact.emergency ? 'border-danger' : ''}`}><div className="d-flex justify-content-between gap-2"><span className="badge bg-secondary">{contact.serviceType}</span>{contact.emergency && <span className="badge bg-danger">Emergency</span>}</div><h2 className="h5 mt-3">{contact.authorityName}</h2><p className="small text-muted mb-2">{contact.coverage}{contact.district ? ` · ${contact.district}` : ` · ${contact.state}`}</p>{contact.instructions && <p>{contact.instructions}</p>}
      <div className="d-flex flex-wrap gap-2 mb-3">{contact.phone && <a className="btn btn-primary" href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}>Call {contact.phone}</a>}{contact.alternatePhone && <a className="btn btn-outline-primary" href={`tel:${contact.alternatePhone.replace(/[^+\d]/g, '')}`}>Alternate {contact.alternatePhone}</a>}{contact.email && <a className="btn btn-outline-secondary" href={`mailto:${contact.email}`}>Email</a>}</div>
      {contact.address && <p className="small mb-2">{contact.address}</p>}<div className="mt-auto small text-muted">Verified {contact.verifiedAt || 'date not recorded'} · <a href={contact.officialSourceUrl} target="_blank" rel="noreferrer">Official source</a></div></article></div>)}</div> : <div className="empty-state mb-5"><h2 className="h5">No contacts match those filters</h2><p>Try a state-wide search or clear the service filter.</p></div>}

    {user?.role === 'ADMIN' && <section className="card p-4"><h2 className="h4">Maintain the official directory</h2><p className="text-muted">Add only public authority contacts. Keep the official source URL and verification date current.</p><form className="row g-3 mb-4" onSubmit={save}>
      <div className="col-md-4"><label className="form-label" htmlFor="authority-name">Authority name</label><input id="authority-name" className="form-control" maxLength="120" required value={form.authorityName} onChange={e => setForm({ ...form, authorityName: e.target.value })} /></div>
      <div className="col-md-4"><label className="form-label" htmlFor="authority-type">Service type</label><input id="authority-type" className="form-control" maxLength="40" required value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} /></div>
      <div className="col-md-4"><label className="form-label" htmlFor="authority-phone">Phone</label><input id="authority-phone" className="form-control" maxLength="40" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
      <div className="col-md-4"><label className="form-label" htmlFor="authority-alt">Alternate phone</label><input id="authority-alt" className="form-control" maxLength="40" value={form.alternatePhone || ''} onChange={e => setForm({ ...form, alternatePhone: e.target.value })} /></div>
      <div className="col-md-4"><label className="form-label" htmlFor="authority-email">Email</label><input id="authority-email" type="email" className="form-control" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div className="col-md-4"><label className="form-label" htmlFor="authority-address">Office address</label><input id="authority-address" className="form-control" maxLength="240" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
      <div className="col-md-3"><label className="form-label" htmlFor="authority-state">State</label><input id="authority-state" className="form-control" required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
      <div className="col-md-3"><label className="form-label" htmlFor="authority-district">District</label><input id="authority-district" className="form-control" value={form.district || ''} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
      <div className="col-md-3"><label className="form-label" htmlFor="authority-coverage">Coverage</label><select id="authority-coverage" className="form-select" value={form.coverage} onChange={e => setForm({ ...form, coverage: e.target.value })}>{['NATIONAL','STATE','DISTRICT','LOCAL'].map(x => <option key={x}>{x}</option>)}</select></div>
      <div className="col-md-3"><label className="form-label" htmlFor="authority-verified">Verified date</label><input id="authority-verified" type="date" className="form-control" required value={form.verifiedAt || ''} onChange={e => setForm({ ...form, verifiedAt: e.target.value })} /></div>
      <div className="col-md-6"><label className="form-label" htmlFor="authority-source">Official source URL</label><input id="authority-source" type="url" className="form-control" required value={form.officialSourceUrl || ''} onChange={e => setForm({ ...form, officialSourceUrl: e.target.value })} /></div>
      <div className="col-md-6"><label className="form-label" htmlFor="authority-notes">Instructions</label><input id="authority-notes" className="form-control" maxLength="1200" value={form.instructions || ''} onChange={e => setForm({ ...form, instructions: e.target.value })} /></div>
      <div className="col-12"><label className="form-check-label me-4"><input className="form-check-input me-2" type="checkbox" checked={form.emergency} onChange={e => setForm({ ...form, emergency: e.target.checked })} />Emergency contact</label><label className="form-check-label"><input className="form-check-input me-2" type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />Publicly active</label></div>
      <div className="col-12"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add contact'}</button>{editingId && <button type="button" className="btn btn-outline-secondary ms-2" onClick={reset}>Cancel edit</button>}</div>
    </form><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Authority</th><th>Location</th><th>Verified</th><th>State</th><th>Actions</th></tr></thead><tbody>{managed.map(contact => <tr key={contact.id}><td>{contact.authorityName}<div className="small text-muted">{contact.phone}</div></td><td>{contact.district || contact.state}</td><td>{contact.verifiedAt || '—'}</td><td>{contact.active ? 'Public' : 'Withdrawn'}</td><td><button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(contact)}>Edit</button>{contact.active && <button className="btn btn-sm btn-outline-danger" onClick={() => withdraw(contact)}>Withdraw</button>}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
