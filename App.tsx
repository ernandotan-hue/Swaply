import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AddSkill from './pages/AddSkill';
import SwapProgress from './pages/SwapProgress';
import { store } from './services/mockStore';
import { ArrowRight, UserPlus, LogIn, Mail, Lock, User as UserIcon, MapPin } from 'lucide-react';

// Enhanced Authentication Component
const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        location: '',
        bio: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const result = store.login(formData.email);
            if (result.success) {
                navigate('/');
            } else {
                setError('Invalid credentials. (Hint: Try alex@example.com)');
            }
        } else {
            // Register logic
            if (!formData.name || !formData.email || !formData.password) {
                setError('Please fill in all required fields.');
                return;
            }
            store.register({
                name: formData.name,
                email: formData.email,
                location: formData.location || 'Unknown',
                bio: formData.bio || 'New member of Swaply.'
            });
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[600px] border border-slate-100">
                
                {/* Left Side - Visual */}
                <div className="hidden md:flex w-1/2 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10 text-white">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl mb-8">S</div>
                        <h1 className="text-4xl font-bold mb-6">Exchange Skills.<br/>Grow Together.</h1>
                        <p className="text-indigo-100 text-lg">Join a community of 10,000+ swappers trading design, coding, music, and more.</p>
                    </div>
                    <div className="relative z-10">
                         <div className="flex -space-x-4 mb-4">
                            <img className="w-10 h-10 rounded-full border-2 border-indigo-600" src="https://picsum.photos/id/64/100" />
                            <img className="w-10 h-10 rounded-full border-2 border-indigo-600" src="https://picsum.photos/id/65/100" />
                            <img className="w-10 h-10 rounded-full border-2 border-indigo-600" src="https://picsum.photos/id/91/100" />
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white text-indigo-600 flex items-center justify-center text-xs font-bold">+2k</div>
                         </div>
                         <p className="text-indigo-200 text-sm">Join the community today.</p>
                    </div>
                    
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-800 rounded-full blur-3xl -ml-20 -mb-20 opacity-50"></div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-500 mb-8">{isLogin ? 'Enter your details to access your account.' : 'Start your journey with Swaply today.'}</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="New York, USA"
                                            value={formData.location}
                                            onChange={e => setFormData({...formData, location: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="email" 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="password" 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                        <button 
                            type="submit"
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLogin ? (
                                <>
                                    <LogIn className="w-5 h-5" /> Sign In
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" /> Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="ml-2 font-bold text-indigo-600 hover:text-indigo-800 transition"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = store.getCurrentUser();
    if (!user) return <Navigate to="/login" replace />;
    return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />

        {/* Protected Routes */}
        <Route path="/progress" element={<ProtectedRoute><Layout><SwapProgress /></Layout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/add-skill" element={<ProtectedRoute><Layout><AddSkill /></Layout></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;