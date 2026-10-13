import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const workspace = user?.role === 'ADMIN' ? '/admin' : user?.role === 'WORKER' ? '/worker' : '/citizen';
  const portals = [
    { icon: '⌂', title: 'Citizen Portal', detail: 'Report & track civic issues', role: 'citizen', href: user?.role === 'CITIZEN' ? '/citizen' : '/login?role=citizen' },
    { icon: '⚒', title: 'Municipal Worker Portal', detail: 'View & update assigned field tasks', role: 'worker', href: user?.role === 'WORKER' ? '/worker' : '/login?role=worker' },
    { icon: '⬡', title: 'Administrator Portal', detail: 'Dispatch, departments & priority queue', role: 'admin', href: user?.role === 'ADMIN' ? '/admin' : '/login?role=admin' },
  ];

  useEffect(() => {
    api.getCategories()
      .then(response => setCategories(response.data || []))
      .catch(() => setCategoryError('Service categories are temporarily unavailable.'))
      .finally(() => setCategoriesLoading(false));
  }, []);

  return <>
    <section className="hero"><div className="container"><div className="row align-items-center g-5"><div className="col-lg-7"><div className="hero-content">
      <span className="eyebrow"><span className="signal" />Civic issues, followed through</span>
      <h1>Better neighbourhoods start with one report.</h1>
      <p>Report a local problem, follow its progress, and see how your community and service teams respond.</p>
      <div className="d-flex flex-wrap gap-3 mt-4"><Link to={user ? workspace : '/register'} className="btn btn-primary btn-lg">{user ? 'Open your workspace' : 'Create an account'} <span className="ms-1">â†’</span></Link><a href="#how-it-works" className="btn btn-outline-light btn-lg">How it works</a></div>
      <div className="hero-portals" aria-label="Choose a QuickerFix portal">
        {portals.map(portal => <Link className="hero-portal-card" to={portal.href} key={portal.role}>
          <span className="hero-portal-icon" aria-hidden="true">{portal.icon}</span>
          <span className="hero-portal-copy"><strong>{portal.title}</strong><small>{portal.detail}</small></span>
          <span className="hero-portal-arrow" aria-hidden="true">→</span>
        </Link>)}
      </div>
    </div></div><div className="col-lg-5"><div className="hero-panel"><div className="d-flex align-items-center gap-2"><span className="signal" /><strong>From report to resolution</strong></div><p className="mt-2">Each issue has a clear status, an accountable team, and a visible next step.</p><ol className="list-unstyled mt-4 mb-0">{[['01', 'Report the issue'], ['02', 'Review and assign'], ['03', 'Complete and confirm']].map(([step, label]) => <li className="d-flex align-items-center gap-3 py-3 border-top" key={step}><span className="step-number">{step}</span><strong>{label}</strong></li>)}</ol></div></div></div></div></section>

    <section className="section" id="categories"><div className="container"><div className="row align-items-end mb-4"><div className="col-lg-7"><span className="eyebrow text-primary bg-white border">Service categories</span><h2 className="section-title mt-3">Send each issue to the right team.</h2></div><div className="col-lg-5"><p className="section-copy mb-0">Choose from the active categories configured by the local service administration.</p></div></div>
      {categoryError ? <div className="alert alert-warning" role="alert">{categoryError} <button className="btn btn-sm btn-outline-warning ms-2" onClick={() => { setCategoriesLoading(true); setCategoryError(''); api.getCategories().then(response => setCategories(response.data || [])).catch(() => setCategoryError('Service categories are temporarily unavailable.')).finally(() => setCategoriesLoading(false)); }}>Retry</button></div> : categoriesLoading ? <p className="text-muted" role="status">Loading available categoriesâ€¦</p> : categories.length === 0 ? <p className="text-muted">No service categories have been published yet.</p> : <div className="row g-3">{categories.map(category => <div className="col-6 col-md-3" key={category.id}><div className="category-card"><div className="category-icon" aria-hidden="true">{category.icon}</div><h6>{category.name}</h6><span>{category.departmentName || 'Community services'}</span></div></div>)}</div>}
    </div></section>

    <section className="section pt-2" id="how-it-works"><div className="container"><div className="text-center mb-5"><span className="eyebrow text-primary bg-white border">Clear from start to finish</span><h2 className="section-title mt-3">A transparent resolution journey.</h2><p className="section-copy mx-auto">Every report moves through review, assignment, field work, and citizen confirmation.</p></div><div className="row g-3">{[['01 Â· REPORT', 'Describe the issue', 'Add a useful description, location, and optional photos.'], ['02 Â· TRACK', 'Follow each update', 'See report status and communicate with the responsible team.'], ['03 Â· CONFIRM', 'Close the loop', 'Review the completion evidence and confirm whether the issue is resolved.']].map(([number, title, copy]) => <div className="col-md-4" key={number}><div className="step-card"><span className="step-number">{number}</span><h5>{title}</h5><p>{copy}</p></div></div>)}</div></div></section>

    <section className="container pb-5"><div className="trust-banner"><div className="row align-items-center g-4"><div className="col-lg-8"><h2>Make local service more visible.</h2><p className="mb-0">One place for residents and service teams to coordinate and track civic work.</p></div><div className="col-lg-4 text-lg-end"><Link to={user ? workspace : '/register'} className="btn btn-light btn-lg">{user ? 'Go to workspace' : 'Get started'} â†’</Link></div></div></div></section>
  </>;
};

export default Home;
