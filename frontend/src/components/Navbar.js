import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Navbar = () => {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getUnreadCount().then(res => setUnreadCount(res.data)).catch(console.error);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">🚧 QuickerFix</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user?.role === 'CITIZEN' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/citizen">Report Problem</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/citizen">My Complaints</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/citizen">Nearby Issues</Link></li>
              </>
            )}
            {user?.role === 'WORKER' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/worker">My Tasks</Link></li>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/admin">Dashboard</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin/priority">Priority Queue</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/admin">Users</Link></li>
              </>
            )}
          </ul>
          <ul className="navbar-nav">
            {!user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="demoDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Demo Login
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="demoDropdown">
                    <li><button className="dropdown-item" onClick={() => demoLogin('CITIZEN')}>Citizen</button></li>
                    <li><button className="dropdown-item" onClick={() => demoLogin('WORKER')}>Worker</button></li>
                    <li><button className="dropdown-item" onClick={() => demoLogin('ADMIN')}>Admin</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><span className="nav-link text-white">Hello, {user.name}</span></li>
                <li className="nav-item">
                  <Link className="nav-link" to="/notifications">
                    <i className="bi bi-bell"></i>
                    {unreadCount > 0 && <span className="badge bg-danger ms-1">{unreadCount}</span>}
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm mt-1 ms-2" onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
