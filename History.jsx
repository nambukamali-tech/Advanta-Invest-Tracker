import React, { useEffect, useState } from 'react';
import api from '../../api';

const History = () => {
  const [investments, setInvestments] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invResp, projResp] = await Promise.all([
          api.get('/investment/my'),
          api.get('/project')
        ]);
        setInvestments(invResp.data);
        setProjects(projResp.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Investment History</h1>

      <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto', background: 'white' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Project Name</th>
              <th>Location</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(inv => {
              const project = projects.find(p => p.id === inv.projectId);
              return (
                <tr key={inv.id}>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: '600' }}>{project?.name || 'N/A'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{project?.location || 'N/A'}</td>
                  <td>{inv.paymentMethod}</td>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{inv.amount.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #d1fae5'
                    }}>Completed</span>
                  </td>
                </tr>
              );
            })}
            {investments.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  You haven't made any investments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
