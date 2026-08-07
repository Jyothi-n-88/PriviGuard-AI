/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { Assessments } from './pages/Assessments';
import { RiskCenter } from './pages/RiskCenter';
import { DataFlows } from './pages/DataFlows';
import { Remediation } from './pages/Remediation';
import { Reports } from './pages/Reports';
import { Organizations } from './pages/Organizations';
import { ProcessingActivities } from './pages/ProcessingActivities';
import { Settings } from './pages/Settings';
import { DesignShowcase } from './pages/DesignShowcase';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/design" element={<DesignShowcase />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Accessible by all authenticated users */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/risk-center" element={<RiskCenter />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Restricted access */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'dpo', 'privacy_manager', 'compliance_officer', 'analyst']} />}>
              <Route path="/data-flows" element={<DataFlows />} />
              <Route path="/remediation" element={<Remediation />} />
              <Route path="/processing-activities" element={<ProcessingActivities />} />
            </Route>

            {/* Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
