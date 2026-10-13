import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  {
    key: 'CITIZEN',
    icon: '🏘️',
    label: 'Citizen',
    desc: 'Report & track civic issues',
    redirect: '/citizen',
  },
  {
    key: 'WORKER',
    icon: '🔧',
    label: 'Field Worker',
    desc: 'View & update assigned jobs',
    redirect: '/worker',
  },
  {
    key: 'ADMIN',
    icon: '🛡️',
    label: 'Administrator',
    desc: 'Manage reports, staff & system',
    redirect: '/admin',
  },
];

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const roleFromQuery = (value) => ({ citizen: 'CITIZEN', worker: 'WORKER', admin: 'ADMIN' }[String(value || '').toLowerCase()] || 'CITIZEN');
  const [selectedRole, setSelectedRole] = useState(() => roleFromQuery(searchParams.get('role')));
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleEnabled = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  useEffect(() => {
    setSelectedRole(roleFromQuery(searchParams.get('role')));
  }, [location.search]);

  const selectRole = (role) => {
    setSelectedRole(role);
    setError('');
    setSearchParams({ role: role.toLowerCase() }, { replace: true });
  };

  const redirectForRole = (role) => {
    const match = ROLES.find(r => r.key === role);
    return match ? match.redirect : '/citizen';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      navigate(redirectForRole(userData.role));
    } catch {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const userData = await googleLogin(credentialResponse.credential);
      navigate(redirectForRole(userData.role));
    } catch {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: 520 }}>

        {/* Header */}
        <div className="text-center mb-4">
          <img className="auth-brand-icon" src="/quickerfix-icon.png" alt="QuickerFix" />
          <span className="eyebrow">Welcome back</span>
          <h2 className="mt-3 mb-1">Sign in to QuickerFix</h2>
          <p className="lead mb-0">Choose your role and sign in below.</p>
        </div>

        {/* Role Selector */}
        <div className="d-flex gap-2 mb-4" role="group" aria-label="Select your role">
          {ROLES.map((role) => (
            <button
              key={role.key}
              type="button"
              onClick={() => selectRole(role.key)}
              className="role-tile flex-fill"
              data-active={selectedRole === role.key}
              aria-pressed={selectedRole === role.key}
            >
              <span className="role-tile-icon">{role.icon}</span>
              <span className="role-tile-label">{role.label}</span>
              <span className="role-tile-desc">{role.desc}</span>
            </button>
          ))}
        </div>

        {/* Info banner for non-citizen roles */}
        {selectedRole !== 'CITIZEN' && (
          <div className="alert alert-info mb-3" role="note">
            <strong>{selectedRole === 'ADMIN' ? '🛡️ Administrator' : '🔧 Worker'} accounts</strong> are issued by the
            municipal administration. Contact your administrator if you need access.
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</>
              : `Sign in as ${ROLES.find(r => r.key === selectedRole)?.label}`}
          </button>
        </form>

        {/* Google login (citizens only) */}
        {googleEnabled && selectedRole === 'CITIZEN' && (
          <>
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted small">or</span>
              <hr className="flex-grow-1" />
            </div>
            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed. Please try again.')}
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
              />
            </div>
          </>
        )}

        {/* Register link */}
        {selectedRole === 'CITIZEN' && (
          <div className="mt-3 text-center">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--brand)', fontWeight: 700 }}>
              Create a citizen account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
