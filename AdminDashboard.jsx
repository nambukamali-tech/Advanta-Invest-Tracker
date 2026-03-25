import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  LayoutDashboard, 
  Briefcase, 
  Receipt, 
  Users 
} from 'lucide-react';
import Overview from './admin/Overview';
import Projects from './admin/Projects';
import Expenses from './admin/Expenses';
import Investments from './admin/Investments';

const AdminDashboard = () => {
  const links = [
    { path: '/admin', label: 'Overview', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/admin/projects', label: 'Projects', icon: <Briefcase size={20} /> },
    { path: '/admin/investments', label: 'Investments', icon: <Users size={20} /> },
    { path: '/admin/expenses', label: 'Expenses', icon: <Receipt size={20} /> },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar links={links} />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="projects" element={<Projects />} />
          <Route path="investments" element={<Investments />} />
          <Route path="expenses" element={<Expenses />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
