/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './services/api';

function Placeholder() {
  const [health, setHealth] = useState<string>('Checking backend health...');

  useEffect(() => {
    api.get('/health')
      .then(res => {
        if (res.data.success) {
          setHealth(`✅ Backend is running: ${res.data.message}`);
        } else {
          setHealth('⚠️ Backend returned unexpected response.');
        }
      })
      .catch(err => {
        setHealth(`❌ Backend connection failed: ${err.message}`);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">PriviGuard AI</h1>
        <p className="text-gray-600 mb-6">Phase 3.1: Technical Foundation</p>
        
        <div className="p-4 bg-gray-100 rounded border border-gray-200">
          <p className="font-mono text-sm">{health}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Placeholder />} />
      </Routes>
    </Router>
  );
}
