import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Client' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', color: 'var(--primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Join Advanta's Investment Community</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              placeholder="Your Full Name" 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              placeholder="example@advanta.com" 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••" 
            />
          </div>
          <div className="input-group">
            <label>Profile Role</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Client">Client (Investor)</option>
              <option value="Admin">Admin (Advanta Staff)</option>
            </select>
          </div>
          
          {error && <p style={{ color: 'var(--danger)', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
          {message && <p style={{ color: 'var(--secondary)', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.9rem' }}>{message}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="primary"
            style={{ 
              width: '100%', 
              padding: '0.875rem', 
              fontSize: '1rem',
              background: 'var(--secondary)',
              marginTop: '1rem'
            }}
          >
            {loading ? 'Creating Account...' : <><UserPlus size={20} /> Register Now</>}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Existing member? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>LogIn</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
