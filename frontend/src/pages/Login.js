import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, demoLogin } = useAuth();
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
      navigate('/');
    } catch (err) {
      setError('Demo login failed.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h2 className="text-center mb-4">Login</h2>
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
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
            <div className="mt-3 text-center">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
            
            <hr className="my-4" />
            <h5 className="text-center mb-3">Quick Demo Credentials</h5>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-secondary" onClick={() => handleDemo('CITIZEN')}>Login as Citizen</button>
              <button className="btn btn-outline-secondary" onClick={() => handleDemo('WORKER')}>Login as Worker</button>
              <button className="btn btn-outline-secondary" onClick={() => handleDemo('ADMIN')}>Login as Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
