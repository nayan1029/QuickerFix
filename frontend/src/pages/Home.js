import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, demoLogin } = useAuth();

  const categories = [
    { name: 'Potholes', icon: '🕳️' },
    { name: 'Broken Streetlights', icon: '💡' },
    { name: 'Garbage', icon: '🗑️' },
    { name: 'Water Leakage', icon: '🚰' },
    { name: 'Damaged Roads', icon: '🛣️' },
    { name: 'Electrical', icon: '⚡' },
    { name: 'Fallen Trees', icon: '🌳' },
    { name: 'Public Infrastructure', icon: '🚧' }
  ];

  return (
    <div>
      <div className="bg-dark text-white text-center py-5">
        <h1 className="display-4 fw-bold">Report. Track. Resolve. 🚧</h1>
        <p className="lead">Empowering citizens to improve their communities</p>
      </div>

      <div className="container mt-5">
        <div className="row text-center mb-5">
          <div className="col-md-4">
            <div className="card p-4">
              <h3>Total Reports</h3>
              <p className="display-6 text-primary">1,245</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-4">
              <h3>Active Issues</h3>
              <p className="display-6 text-warning">324</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-4">
              <h3>Avg Resolution Time</h3>
              <p className="display-6 text-success">3.2 Days</p>
            </div>
          </div>
        </div>

        <h2 className="text-center mb-4">Categories</h2>
        <div className="row text-center mb-5">
          {categories.map((cat, idx) => (
            <div key={idx} className="col-6 col-md-3 mb-4">
              <div className="card p-3 h-100">
                <div className="display-4">{cat.icon}</div>
                <div className="mt-2 fw-bold">{cat.name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-5 bg-light rounded-3 mb-5">
          <h2>Ready to make a difference?</h2>
          <p className="lead">Report a Problem Today</p>
          <Link to="/citizen" className="btn btn-primary btn-lg mt-3">Report a Problem</Link>
          
          {!user && (
            <div className="mt-4">
              <p>Or try our demo accounts:</p>
              <button className="btn btn-outline-secondary m-1" onClick={() => demoLogin('CITIZEN')}>Login as Citizen</button>
              <button className="btn btn-outline-secondary m-1" onClick={() => demoLogin('WORKER')}>Login as Worker</button>
              <button className="btn btn-outline-secondary m-1" onClick={() => demoLogin('ADMIN')}>Login as Admin</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
