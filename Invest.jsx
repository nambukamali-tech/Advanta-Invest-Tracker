import React, { useEffect, useState } from 'react';
import api from '../../api';
import { CreditCard, CheckCircle } from 'lucide-react';

const Invest = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({ projectId: '', amount: 0, paymentMethod: 'GPay' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const resp = await api.get('/project');
        setProjects(resp.data);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) return alert('Please select a project');

    setLoading(true);
    try {
      await api.post('/investment', formData);
      setMessage('Investment successful! Thank you for trusting Advanta.');
      setFormData({ projectId: '', amount: 0, paymentMethod: 'GPay' });
    } catch (err) {
      console.error(err);
      alert('Error processing investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>New Investment</h1>

      {message ? (
        <div className="glass" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--secondary)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Investment Recorded</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>{message}</p>
          <button onClick={() => setMessage('')} className="primary" style={{ padding: '0.8rem 2.5rem' }}>
            New Investment
          </button>
        </div>
      ) : (
        <div className="glass" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Select Project</label>
              <select required value={formData.projectId} onChange={e => setFormData({ ...formData, projectId: e.target.value })}>
                <option value="">-- Choose a Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Investment Amount (₹)</label>
              <input
                type="number"
                required
                min="1000"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div className="input-group">
              <label>Payment Method</label>
              <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                <option value="GPay">GPay</option>
                <option value="Paytm">Paytm</option>
                <option value="NEFT">NEFT</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="var(--primary)" />
                Secure transaction processed by Advanta Finance Team.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="primary"
              style={{
                width: '100%',
                padding: '1rem',
                marginTop: '2rem',
                fontSize: '1.05rem'
              }}
            >
              {loading ? 'Processing...' : 'Confirm My Investment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Invest;
