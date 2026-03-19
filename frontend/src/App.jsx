import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Docs from './pages/Docs';
import Pricing from './pages/Pricing';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Query from './pages/Query';
import Upload from './pages/Upload';
import Settings from './pages/Settings';
import Layout from './Layout';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('arcaive_auth') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/query" element={<ProtectedRoute><Query /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
