import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Wallet, Receipt, History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientOverview = () => {
  const [data, setData] = useState({ investments: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    try {
      const [inv, exp] = await Promise.all([
        api.get('/investment/my'),
        api.get('/expense')
      ]);

      const expensesData = Array.isArray(exp.data)
        ? exp.data
        : exp.data?.expenses || [];

      const investmentsData = Array.isArray(inv.data)
        ? inv.data
        : inv.data?.investments || [];

      setData({ investments: investmentsData, expenses: expensesData });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  const totalInvested = data.investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalExpenses = data.expenses.reduce((sum, exp) => sum + (exp.total || exp.amount || 0), 0);
  const pendingCount = data.expenses.filter(e => e.status === 'Pending').length;

  const combinedActivity = [
    ...data.investments.map(i => ({ ...i, type: 'Investment' })),
    ...data.expenses.map(e => ({ ...e, type: 'Expense' }))
  ]
    .filter(item => item.date) // ← skip items with no date
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle size={14} color="var(--secondary)" />;
      case 'Rejected': return <XCircle size={14} color="var(--danger)" />;
      default: return <Clock size={14} color="#854d0e" />;
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>My Financial Overview</h1>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="glass" style={{ padding: '1.5rem', flex: 1, minWidth: '350px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Submitted Expenses</p>
            <h2 style={{ fontSize: '2.5rem' }}>₹{totalExpenses.toLocaleString()}</h2>
            {pendingCount > 0 && (
              <span style={{ fontSize: '0.85rem', color: '#854d0e', fontWeight: '600' }}>
                {pendingCount} Pending Approval
              </span>
            )}
          </div>
          <Receipt color="var(--primary)" size={48} />
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} /> Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {combinedActivity.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: item.type === 'Investment' ? '#f0fdf4' : '#fef2f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {item.type === 'Investment'
                    ? <Wallet size={18} color="var(--secondary)" />
                    : <Receipt size={18} color="var(--danger)" />}
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.1rem' }}>
                    {item.type === 'Investment' ? 'New Investment' : (item.description || item.supplierName || 'Expense')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                    {item.type === 'Expense' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        • {getStatusIcon(item.status)} {item.status || 'Pending'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ fontWeight: 'bold', color: item.type === 'Investment' ? 'var(--secondary)' : 'var(--danger)' }}>
                {item.type === 'Investment'
                  ? `+₹${(item.amount || 0).toLocaleString()}`
                  : `-₹${(item.total || item.amount || 0).toLocaleString()}`}
              </p>
            </div>
          ))}
          {combinedActivity.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
              No recent activity found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;