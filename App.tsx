
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { STORAGE_KEYS } from './constants';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Layout/Layout';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import ManagerDashboard from './components/Dashboard/ManagerDashboard';

export type AppSection = 'DASHBOARD' | 'ROOMS' | 'COMPLAINTS' | 'BILLING' | 'ANALYTICS';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activeSection, setActiveSection] = useState<AppSection>('DASHBOARD');

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(u));
    setActiveSection('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setActiveSection('DASHBOARD');
  };

  if (!user) {
    return view === 'LOGIN' 
      ? <Login onLogin={handleLogin} onToggle={() => setView('REGISTER')} /> 
      : <Register onRegister={handleLogin} onToggle={() => setView('LOGIN')} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeSection={activeSection} 
      setActiveSection={setActiveSection}
    >
      {user.role === UserRole.STUDENT ? (
        <StudentDashboard user={user} setUser={setUser} activeSection={activeSection} />
      ) : (
        <ManagerDashboard user={user} activeSection={activeSection} setActiveSection={setActiveSection} />
      )}
    </Layout>
  );
};

export default App;
