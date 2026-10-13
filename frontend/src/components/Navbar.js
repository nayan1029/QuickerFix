import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const close = () => setOpen(false);
  const workspace = user?.role === 'ADMIN' ? '/admin' : user?.role === 'WORKER' ? '/worker' : '/citizen';

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    api.getUnreadCount().then(response => setUnread(response.data?.count || 0)).catch(() => setUnread(0));
  }, [user]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/" onClick={close}><img className="brand-mark" src="/quickerfix-icon.png" alt="" />QuickerFix</Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/notices" onClick={close}>Noticeboard</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contacts" onClick={close}>Emergency contacts</Link></li>
            {user && <li className="nav-item"><Link className="nav-link" to={workspace} onClick={close}>Workspace</Link></li>}
            {user?.role === 'ADMIN' && <li className="nav-item"><Link className="nav-link" to="/admin/priority" onClick={close}>Priority queue</Link></li>}
            {!user && <><li className="nav-item"><a className="nav-link" href="/#how-it-works" onClick={close}>How it works</a></li><li className="nav-item"><a className="nav-link" href="/#categories" onClick={close}>Categories</a></li></>}
          </ul>
          <ul className="navbar-nav align-items-lg-center">
            {!user ? <><li className="nav-item"><Link className="nav-link" to="/login" onClick={close}>Sign in</Link></li><li className="nav-item"><Link className="nav-link nav-cta" to="/register" onClick={close}>Create account</Link></li></> : <>
              <li className="nav-item"><span className="nav-link">{user.name}</span></li>
              {unread > 0 && <li className="nav-item"><span className="nav-link">{unread} new</span></li>}
              <li className="nav-item"><button className="btn btn-sm btn-outline-light ms-lg-2" onClick={() => { logout(); navigate('/'); close(); }}>Sign out</button></li>
            </>}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
