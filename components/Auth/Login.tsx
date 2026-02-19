
import React, { useState } from 'react';
import { database } from '../../store';
import { User, UserRole } from '../../types';
import { Mail, Lock, ShieldCheck, ArrowRight, UserCircle, Briefcase } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onToggle: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onToggle }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default Hardcoded Admin for testing
    if (role === UserRole.MANAGER && email === 'admin@hostel.com' && password === 'admin') {
      onLogin({
        id: 'admin-1',
        name: 'Manager Smith',
        email: 'admin@hostel.com',
        role: UserRole.MANAGER
      });
      return;
    }

    const users = database.getUsers();
    const user = users.find(u => u.email === email && u.role === role);
    
    // Validate password from database
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError(`Invalid ${role.toLowerCase()} credentials. Check your email or password.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalpataru Boys Hostel</h1>
          <p className="text-slate-500 mt-2">Welcome back! Please sign in to your account.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setRole(UserRole.STUDENT)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                role === UserRole.STUDENT ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCircle size={18} /> Student
            </button>
            <button
              onClick={() => setRole(UserRole.MANAGER)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                role === UserRole.MANAGER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Briefcase size={18} /> Warden
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-6">Sign In as {role === UserRole.STUDENT ? 'Student' : 'Warden'}</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 group transition-all"
            >
              Log In
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="grid grid-cols-1 gap-2 text-center">
                <p className="text-[10px] text-slate-400">
                  Default Admin: admin@hostel.com / admin
                </p>
             </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-sm">
          New user?{' '}
          <button onClick={onToggle} className="text-indigo-600 font-bold hover:underline transition-all">
            Create an Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;