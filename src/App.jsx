import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Sidebar, MobileHeader } from './components/Sidebar';
import Login            from './pages/Login';
import Register         from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import MyComplaints     from './pages/MyComplaints';
import SubmitComplaint  from './pages/SubmitComplaint';
import AdminDashboard   from './pages/AdminDashboard';
import { subscribeToAuth, logoutCurrentSession } from './services/authService';
import { isFirebaseConfigured } from './lib/firebase';
import { Wrench } from 'lucide-react';

/**
 * App — routing shell with Firebase Authentication & role-based route protection.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    await logoutCurrentSession();
    setUser(null);
    setSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-page)',
        gap: '16px',
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--color-mint)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s infinite ease-in-out',
        }}>
          <Wrench size={24} />
        </div>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
        }}>
          Initializing CampusFix…
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!isFirebaseConfigured && (
        <div style={{
          background: 'var(--color-mint)',
          borderBottom: '1px solid var(--color-mint-dark)',
          padding: '8px 16px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 600,
        }}>
          <span>⚡ Local Fallback Mode Active</span>
          <span style={{ fontWeight: 400, color: 'var(--color-text-secondary)' }}>
            (Connect Firebase by setting VITE_FIREBASE_* in .env to enable Cloud Firestore and Firebase Auth)
          </span>
        </div>
      )}

      <Routes>
        {/* Public auth routes (redirect to role dashboard if already authenticated) */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
            ) : (
              <Register onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Student Routes */}
        <Route
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'student' ? (
              <AppLayout
                user={user}
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            ) : (
              /* Admin attempting student route -> redirect to admin home */
              <Navigate to="/admin" replace />
            )
          }
        >
          <Route path="/dashboard" element={<StudentDashboard user={user} />} />
          <Route path="/my-complaints" element={<MyComplaints user={user} />} />
          <Route path="/submit" element={<SubmitComplaint user={user} />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'admin' ? (
              <AppLayout
                user={user}
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            ) : (
              /* Student attempting admin route -> redirect to student home */
              <Navigate to="/dashboard" replace />
            )
          }
        >
          <Route path="/admin" element={<AdminDashboard user={user} />} />
          <Route path="/admin/complaints" element={<AdminDashboard user={user} />} />
          <Route path="/admin/settings" element={<AdminDashboard user={user} />} />
        </Route>

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/** Authenticated layout wrapper with sidebar */
function AppLayout({ user, onLogout, sidebarOpen, setSidebarOpen }) {
  return (
    <div className="app-layout">
      <MobileHeader onOpen={() => setSidebarOpen(true)} />
      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
