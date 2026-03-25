import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', { email, password });
      login(resp.data, resp.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'white' }}>
      {/* Left Side: Hero Image */}
      <div style={{ 
        flex: 1, 
        backgroundImage: 'url("/login-bg.png")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to bottom, rgba(30, 58, 138, 0.4), rgba(30, 58, 138, 0.8))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          color: 'white'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', color: 'white' }}>Advanta</h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '500px', opacity: 0.9, lineHeight: 1.6 }}>
          'Invest Smart , Grow Strong with Advanta'
          </p>
          <p style={{ fontSize: '1.25rem', maxWidth: '500px', opacity: 0.9, lineHeight: 1.6 }}>
          Your Ultimate Investment Tracker for Informed Decisions and Financial Growth
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div style={{ width: '100%', maxWidth: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please enter your credentials to access your dashboard.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@advanta.com" 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>
            
            {error && <p style={{ color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="primary"
              style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '1rem',
                marginTop: '1rem'
              }}
            >
              {loading ? 'Authenticating...' : <><LogIn size={20} /> Sign In</>}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New to the platform? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
