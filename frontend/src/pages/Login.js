import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, demoLogin, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleDemo = async (role) => {
    try {
      await demoLogin(role);
      navigate(role === 'ADMIN' ? '/admin' : role === 'WORKER' ? '/worker' : '/citizen');
    } catch (err) {
      setError('Demo login failed.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const userData = await googleLogin(credentialResponse.credential);
      navigate(userData.role === 'ADMIN' ? '/admin' : userData.role === 'WORKER' ? '/worker' : '/citizen');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
            <div className="text-center mb-4"><span className="eyebrow text-primary bg-white border">Welcome back</span>
            <h2 className="mt-3 mb-2">Sign in to QuickerFix</h2><p className="lead mb-0">Track issues and keep your community moving.</p></div>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Sign in to your account</button>
            </form>

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

            <div className="mt-3 text-center">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
            
            <hr className="my-4" />
            <h6 className="text-center mb-3 fw-bold">Explore a demo workspace</h6>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-secondary demo-button" onClick={() => handleDemo('CITIZEN')}>Citizen workspace <span>→</span></button>
              <button className="btn btn-outline-secondary demo-button" onClick={() => handleDemo('WORKER')}>Field worker workspace <span>→</span></button>
              <button className="btn btn-outline-secondary demo-button" onClick={() => handleDemo('ADMIN')}>Admin command centre <span>→</span></button>
            </div>
      </div>
    </div>
  );
};

export default Login;
