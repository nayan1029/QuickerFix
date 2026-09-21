import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });
  const [error, setError] = useState('');
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError('Registration failed.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/citizen');
    } catch (err) {
      setError('Google sign-up failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
            <div className="text-center mb-4"><span className="eyebrow text-primary bg-white border">Community account</span>
            <h2 className="mt-3 mb-2">Start making a difference</h2><p className="lead mb-0">Create your citizen account to report and track local issues.</p></div>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-center mb-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-up failed. Please try again.')}
                text="signup_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
              />
            </div>
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted small">or register with email</span>
              <hr className="flex-grow-1" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="text" name="phone" className="form-control" onChange={handleChange} required />
              </div>
              <div className="alert alert-light border small">
                This form creates a citizen account. Worker and administrator accounts are issued through the municipal administration.
              </div>
              <button type="submit" className="btn btn-primary w-100">Create citizen account</button>
            </form>
            <div className="mt-3 text-center">
              Already have an account? <Link to="/login">Login</Link>
            </div>
      </div>
    </div>
  );
};

export default Register;
