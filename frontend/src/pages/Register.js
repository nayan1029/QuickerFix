import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'CITIZEN', departmentId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.role === 'WORKER') {
      api.getDepartments().then(res => setDepartments(res.data)).catch(console.error);
    }
  }, [formData.role]);

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

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h2 className="text-center mb-4">Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}
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
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select name="role" className="form-select" onChange={handleChange} value={formData.role}>
                  <option value="CITIZEN">Citizen</option>
                  <option value="WORKER">Worker</option>
                </select>
              </div>
              {formData.role === 'WORKER' && (
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select name="departmentId" className="form-select" onChange={handleChange} required>
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>
            <div className="mt-3 text-center">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
