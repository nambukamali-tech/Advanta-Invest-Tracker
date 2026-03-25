import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History 
} from 'lucide-react';
import ClientOverview from './client/Overview';
import Invest from './client/Invest';
import HistoryPage from './client/History';

const ClientDashboard = () => {
  const links = [
    { path: '/client', label: 'My Overview', icon: <LayoutDashboard size={20} />, end: true },
    { path: '/client/invest', label: 'New Investment', icon: <PlusCircle size={20} /> },
    { path: '/client/history', label: 'History', icon: <History size={20} /> },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar links={links} />
      <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
        <Routes>
          <Route index element={<ClientOverview />} />
          <Route path="invest" element={<Invest />} />
          <Route path="history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default ClientDashboard;
