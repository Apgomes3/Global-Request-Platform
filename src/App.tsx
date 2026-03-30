import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard, AdminOverview } from './components/Dashboard';
import { NewRequest } from './components/NewRequest';
import { RequestDetails } from './components/RequestDetails';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-72 min-h-screen">
          <TopBar />
          <div className="pt-24 pb-12 px-6 lg:px-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requests" element={<AdminOverview />} />
              <Route path="/requests/:id" element={<RequestDetails />} />
              <Route path="/new" element={<NewRequest />} />
              <Route path="/approvals" element={<div className="p-10 text-center text-on-surface-variant">Approvals Module - Coming Soon</div>} />
              <Route path="/settings" element={<div className="p-10 text-center text-on-surface-variant">Settings Module - Coming Soon</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
