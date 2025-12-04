
import React, { useState, useEffect } from 'react';
import { store } from '../services/mockStore';
import { MapPin, Star, Clock, Plus, Settings, Trophy, ShieldCheck, Award, Wallet, Timer, ShoppingCart, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkillStatus } from '../types';

const Profile: React.FC = () => {
  const currentUser = store.getCurrentUser();
  const [ignored, forceUpdate] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showShop, setShowShop] = useState(false);
  const [buying, setBuying] = useState(false);

  // Countdown Timer Logic
  useEffect(() => {
    if (!currentUser) return;

    const calculateTimeLeft = () => {
        const now = new Date();
        // Ensure date is a valid Date object
        const nextDate = new Date(currentUser.nextFreeCoinDate);
        const diff = nextDate.getTime() - now.getTime();

        if (diff <= 0) {
            setTimeLeft('Ready to claim!');
            // Trigger store check to auto-update balance if logic allows
            // In real app, user might need to click "Claim", but store.login handles auto-claim here
            store.login(currentUser.email); 
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [currentUser, ignored]);

  if (!currentUser) return <div>Please login.</div>;

  const handleVerify = (skillId: string) => {
      store.verifySkill(skillId);
      forceUpdate(prev => prev + 1); // Refresh UI to show status change
  };

  const handleBuyCoin = (amount: number) => {
      setBuying(true);
      setTimeout(() => {
          store.addCoins(amount);
          setBuying(false);
          setShowShop(false);
          forceUpdate(prev => prev + 1);
          alert(`Successfully purchased ${amount} Coin(s)!`);
      }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-10">
        {/* Gamified Header */}
        <div className="relative">
            <div className="h-48 bg-gradient-to-r from-slate-800 to-indigo-900 rounded-3xl overflow-hidden relative">
                <img src="https://picsum.photos/1000/300" className="w-full h-full object-cover opacity-40" />
                <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-300" />
                        {currentUser.points} Pts
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                <div className="p-1 bg-white rounded-full">
                    <img src={currentUser.avatar} className="w-32 h-32 rounded-full border-4 border-white object-cover" />
                </div>
                <div className="mb-4 text-white drop-shadow-md">
                     <h1 className="text-3xl font-bold">{currentUser.name}</h1>
                     <p className="opacity-90 flex items-center gap-1"><MapPin className="w-4 h-4" /> {currentUser.location}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            {/* Left Sidebar */}
            <div className="space-y-6">
                {/* Coin Wallet Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Wallet className="w-5 h-5" />
                            <span className="text-sm font-semibold">My Wallet</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{currentUser.coins} <span className="text-lg font-normal opacity-80">Coins</span></h2>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/20">
                            <div className="flex items-center gap-2 text-xs font-semibold mb-1 opacity-80">
                                <Timer className="w-3 h-3" /> Next Free Coin
                            </div>
                            <div className="text-lg font-mono font-bold tracking-wide">{timeLeft}</div>
                        </div>

                        <button 
                            onClick={() => setShowShop(true)}
                            className="w-full py-2 bg-white text-indigo-700 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-4 h-4" /> Top Up
                        </button>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500 fill-current" />
                        <span className="text-2xl font-bold text-slate-800">{currentUser.rating}</span>
                        <span className="text-slate-400 text-sm">({currentUser.reviewCount} reviews)</span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 mb-2">About Me</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{currentUser.bio}</p>
                </div>
                
                {/* Badges Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-indigo-500" /> Badges
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {currentUser.badges.length > 0 ? currentUser.badges.map((badge, i) => (
                            <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold flex items-center gap-1">
                                🏅 {badge}
                            </span>
                        )) : (
                            <p className="text-sm text-slate-400 italic">No badges earned yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">My Skills & Offers</h2>
                    <Link to="/add-skill" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg">
                        <Plus className="w-4 h-4" /> Add New Skill
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {currentUser.skillsOffered.map(skill => (
                        <div key={skill.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition relative overflow-hidden">
                             <img src={skill.image} className="w-24 h-24 rounded-xl object-cover" />
                             <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-800">{skill.title}</h3>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">{skill.category}</span>
                                        {skill.status === SkillStatus.VERIFIED ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                <ShieldCheck className="w-3 h-3" /> Verified
                                            </span>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 mb-1">
                                                    Pending Verification
                                                </span>
                                                <button 
                                                    onClick={() => handleVerify(skill.id)}
                                                    className="text-[10px] underline text-indigo-500 hover:text-indigo-700"
                                                >
                                                    (Simulate Admin Verify)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                 </div>
                                 <div className="flex gap-4 text-xs text-slate-500 my-2">
                                     <span className="font-medium px-2 py-0.5 bg-slate-50 rounded">Lvl: {skill.level}</span>
                                     <span className="font-medium px-2 py-0.5 bg-slate-50 rounded">Exp: {skill.experience}y</span>
                                 </div>
                                 <p className="text-slate-500 text-sm mt-1 mb-3 line-clamp-2">{skill.description}</p>
                             </div>
                        </div>
                    ))}
                    {currentUser.skillsOffered.length === 0 && (
                        <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-500 mb-4">You haven't listed any skills yet.</p>
                            <Link to="/add-skill" className="text-indigo-600 font-bold hover:underline">Add your first skill</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Shop Modal */}
        {showShop && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-fade-in shadow-2xl">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Swaply Shop</h2>
                            <p className="text-indigo-100 text-sm">Purchase coins to start swapping</p>
                        </div>
                        <button onClick={() => setShowShop(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-amber-300 transition group" onClick={() => !buying && handleBuyCoin(1)}>
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                                <span className="text-2xl">🪙</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800">1 Coin</h3>
                                <p className="text-xs text-slate-500">Perfect for one swap</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600">Rp 15.000</p>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-300 transition group" onClick={() => !buying && handleBuyCoin(5)}>
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800">5 Coins</h3>
                                <p className="text-xs text-slate-500">Best value pack</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-indigo-600">Rp 75.000</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 text-center text-xs text-slate-400 border-t border-slate-100">
                        {buying ? (
                            <span className="flex items-center justify-center gap-2 text-indigo-600 font-bold">
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></span>
                                Processing Payment...
                            </span>
                        ) : (
                            "Secure Payment via MockGateway™"
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Profile;
