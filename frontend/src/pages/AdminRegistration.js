import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { identityService } from '../services/identityService';
import { locationService } from '../services/locationService';
import { toast } from 'react-toastify';
import './AdminRegistration.css';

const AdminRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Personal Info, 2: Credentials, 3: Success
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadharNumber: '',
    designation: '', // e.g., "Chief Administrator", "Senior Officer"
    post: '', // e.g., "Municipal Commissioner", "Deputy Commissioner"
    department: '', // e.g., "Public Works", "Water Supply"
    state: '',
    district: '',
    password: '',
    confirmPassword: ''
  });

  const designations = [
    'Chief Administrator',
    'Senior Officer',
    'Assistant Commissioner',
    'Deputy Commissioner',
    'Municipal Commissioner',
    'Executive Officer',
    'Coordinator',
    'Supervisor'
  ];

  const departments = [
    'Public Works Department',
    'Water Supply',
    'Electricity',
    'Waste Management',
    'Health & Sanitation',
    'Roads & Bridges',
    'Parks & Gardens',
    'Civic Infrastructure'
  ];

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await locationService.getStates();
      setStates(response.data || []);
    } catch (error) {
      toast.error('Failed to load states');
    }
  };

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    setFormData({ ...formData, state: stateId, district: '' });

    if (stateId) {
      try {
        const response = await locationService.getDistrictsByState(stateId);
        setDistricts(response.data || []);
      } catch (error) {
        toast.error('Failed to load districts');
      }
    } else {
      setDistricts([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.aadharNumber) {
      toast.error('Please fill all personal information fields');
      return false;
    }
    if (!formData.designation || !formData.department || !formData.post) {
      toast.error('Please fill designation and department information');
      return false;
    }
    if (!formData.state || !formData.district) {
      toast.error('Please select state and district');
      return false;
    }
    if (!/^\d{12}$/.test(formData.aadharNumber)) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Please enter password');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      const adminData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        aadharNumber: formData.aadharNumber,
        designation: formData.designation,
        post: formData.post,
        department: formData.department,
        stateId: formData.state,
        districtId: formData.district,
        password: formData.password
      };

      const response = await identityService.registerAdmin(adminData);

      if (response.success) {
        toast.success('Admin registration successful! Your profile is pending verification.');
        setStep(3);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-registration-container">
      <div className="registration-card">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">👔 Admin Registration</h3>
          <p className="mb-0 small">Government Official Portal</p>
        </div>

        <div className="card-body p-4">
          {/* Progress Indicator */}
          <div className="progress mb-4">
            <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}>
              Step {step} of 3
            </div>
          </div>

          {step === 1 && (
            <form>
              <h5 className="mb-4">Personal Information</h5>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label fw-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label fw-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label fw-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="aadhar" className="form-label fw-bold">
                    Aadhar Number (for verification)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="aadhar"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit Aadhar"
                    maxLength="12"
                  />
                </div>
              </div>

              <h5 className="mb-4 mt-5">Designation & Department</h5>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="designation" className="form-label fw-bold">
                    Designation
                  </label>
                  <select
                    className="form-select"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((des) => (
                      <option key={des} value={des}>
                        {des}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="post" className="form-label fw-bold">
                    Current Post/Position
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="post"
                    name="post"
                    value={formData.post}
                    onChange={handleInputChange}
                    placeholder="e.g., Officer-in-Charge, Zone 3"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="department" className="form-label fw-bold">
                  Department
                </label>
                <select
                  className="form-select"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <h5 className="mb-4 mt-5">Location</h5>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="state" className="form-label fw-bold">
                    State
                  </label>
                  <select
                    className="form-select"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="district" className="form-label fw-bold">
                    District
                  </label>
                  <select
                    className="form-select"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    disabled={!formData.state}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg w-100 mt-4"
                onClick={handleNext}
              >
                Next: Set Password →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h5 className="mb-4">Set Password</h5>

              <div className="alert alert-info mb-4">
                <strong>ℹ️ Security Requirements:</strong>
                <ul className="mb-0 mt-2">
                  <li>Minimum 8 characters</li>
                  <li>Mix of uppercase and lowercase letters</li>
                  <li>Include numbers and special characters</li>
                </ul>
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-bold">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter secure password"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label fw-bold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                />
              </div>

              <div className="alert alert-warning mb-4">
                <strong>⚠️ Verification Process:</strong>
                <p className="mb-0 mt-2">
                  Your admin profile will be reviewed and verified by the system administrator. You will receive a confirmation email once approved.
                </p>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-success btn-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </>
                  ) : (
                    '✓ Complete Registration'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  ← Back
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center success-message">
              <div className="mb-4">
                <div style={{ fontSize: '3rem' }}>✅</div>
              </div>
              <h5 className="mb-2">Registration Successful!</h5>
              <p className="text-muted mb-4">
                Your admin profile has been submitted for verification.
                <br />
                You will receive a confirmation email shortly.
              </p>
              <p className="small text-info">
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRegistration;
