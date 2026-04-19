import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Issues from './pages/Issues';
import Students from './pages/Students';
import Login from './pages/Login';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function App() {
  // One-time cleanup of demo data
  React.useEffect(() => {
    const hasCleaned = localStorage.getItem('lib_cleaned_v1');
    if (!hasCleaned) {
      localStorage.removeItem('lib_students');
      localStorage.removeItem('lib_issues');
      localStorage.setItem('lib_cleaned_v1', 'true');
      window.location.reload();
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <LibraryProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/books"
                element={
                  <ProtectedRoute>
                    <Books />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issues"
                element={
                  <ProtectedRoute>
                    <Issues />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </LibraryProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
