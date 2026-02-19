
import React, { useState } from 'react';
import { database } from '../../store';
import { User, UserRole } from '../../types';
import { Mail, User as UserIcon, Calendar, ArrowLeft, ShieldCheck, Briefcase, GraduationCap, Lock } from 'lucide-react';

interface RegisterProps {
  onRegister: (user: User) => void;
  onToggle: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onToggle }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    academicYear: 1,
    role: UserRole.STUDENT
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      academicYear: formData.role === UserRole.STUDENT ? formData.academicYear : undefined,
      role: formData.role
    };
    database.saveUser(newUser);
    onRegister(newUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Kalpataru Boys Hostel</h1>
          <p className="text-slate-500 mt-2">Join the hostel management community.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <div className="mb-8">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Registering as</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.STUDENT})}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  formData.role === UserRole.STUDENT 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <GraduationCap size={24} />
                <span className="text-xs font-bold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.MANAGER})}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  formData.role === UserRole.MANAGER 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <Briefcase size={24} />
                <span className="text-xs font-bold">Warden</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="email@example.com"
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            {formData.role === UserRole.STUDENT && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Academic Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-sm"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group mt-4"
            >
              Complete Registration
              <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button onClick={onToggle} className="text-slate-500 text-sm flex items-center justify-center gap-2 mx-auto hover:text-indigo-600 transition-colors font-medium">
              <ArrowLeft size={16} />
              Already have an account? Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;