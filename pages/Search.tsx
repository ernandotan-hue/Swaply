
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, MapPin, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { store } from '../services/mockStore';
import { Skill, SkillCategory } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';
import { findSmartMatches } from '../services/geminiService';

const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [results, setResults] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState<Skill | null>(null);

  // Parse URL params for initial category/skill
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    const skillId = params.get('skill');
    
    if (cat) setSelectedCategory(cat);
    
    // Initial load
    filterResults(query, cat || 'All');

    if (skillId) {
        const skill = store.getSkillById(skillId);
        if (skill) setShowSwapModal(skill);
    }
  }, [location.search]);

  const filterResults = async (q: string, cat: string) => {
    setLoading(true);
    let allSkills = store.getSkills(); // Now only returns Verified skills

    // 1. Filter by Category
    if (cat !== 'All') {
        allSkills = allSkills.filter(s => s.category === cat);
    }

    // 2. Filter by Query (Basic + AI Enhanced if query is long)
    if (q) {
        if (q.length > 3 && process.env.API_KEY) {
            // Use Gemini to match semantics if complex query
            const skillTitles = allSkills.map(s => s.title);
            const matches = await findSmartMatches(q, skillTitles);
            
            if (matches.length > 0) {
                 allSkills = allSkills.filter(s => matches.includes(s.title));
            } else {
                 // Fallback to basic regex
                 allSkills = allSkills.filter(s => s.title.toLowerCase().includes(q.toLowerCase()));
            }
        } else {
             allSkills = allSkills.filter(s => 
                s.title.toLowerCase().includes(q.toLowerCase()) || 
                s.description.toLowerCase().includes(q.toLowerCase())
            );
        }
    }

    setResults(allSkills);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterResults(query, selectedCategory);
  };

  const currentUser = store.getCurrentUser();

  const handleSendRequest = (targetSkill: Skill) => {
      if (!currentUser) {
          navigate('/login');
          return;
      }

      // Coin Check
      if (currentUser.coins < 1) {
          if (confirm("You need 1 coin to initiate a swap. Visit your profile to buy coins or check your free refill time.")) {
              navigate('/profile');
          }
          return;
      }
      
      const myOffer = currentUser.skillsOffered.find(s => true); // Simple pick first available
      if (!myOffer) {
          alert("You need to add a skill to your profile first!");
          navigate('/add-skill');
          return;
      }
      
      const result = store.createSwapRequest(currentUser.id, targetSkill.userId, targetSkill.id, myOffer.id);
      
      if (!result) {
          alert("Failed to create swap. Check your coins.");
          return;
      }

      setShowSwapModal(null);
      // Redirect to chat
      navigate('/messages');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-slate-800">Explore Skills</h1>
        {currentUser && (
            <div className="bg-indigo-50 px-4 py-2 rounded-full text-sm font-bold text-indigo-700 flex items-center gap-2 border border-indigo-100">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] text-yellow-800 border border-yellow-500 shadow-sm">$</div>
                {currentUser.coins} Coins Available
            </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="What do you want to learn? (e.g., 'Guitar lessons')" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
            value={selectedCategory}
            onChange={(e) => {
                setSelectedCategory(e.target.value);
                filterResults(query, e.target.value);
            }}
          >
            <option value="All">All Categories</option>
            {Object.values(SkillCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-md">
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
          <div className="text-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500">Finding best matches...</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(skill => {
                const owner = store.getUserById(skill.userId);
                return (
                    <div key={skill.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                        <div className="relative h-48">
                            <img src={skill.image} alt={skill.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700">
                                {skill.category}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{skill.title}</h3>
                            </div>
                            <div className="flex gap-2 mb-3">
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">{skill.level}</span>
                                <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">{skill.experience}y Exp</span>
                            </div>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{skill.description}</p>
                            
                            <div className="flex items-center gap-3 mb-4 pt-4 border-t border-slate-50">
                                <img src={owner?.avatar} alt={owner?.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{owner?.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {owner?.location}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowSwapModal(skill)}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2"
                            >
                                <ArrowLeftRight className="w-4 h-4" /> Request Swap
                            </button>
                        </div>
                    </div>
                );
            })}
            {results.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-500">
                    No skills found matching your criteria. Try a broader search.
                </div>
            )}
          </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Initiate Swap</h2>
                    <button onClick={() => setShowSwapModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-indigo-500 uppercase">Cost to swap</p>
                            <p className="text-lg font-bold text-indigo-900">1 Coin</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-500 uppercase">Your Balance</p>
                            <p className={`text-lg font-bold ${currentUser && currentUser.coins > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {currentUser?.coins || 0} Coins
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">You Want</p>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                            <img src={showSwapModal.image} className="w-14 h-14 rounded-lg object-cover" />
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{showSwapModal.title}</h4>
                                <p className="text-xs text-slate-500">by {store.getUserById(showSwapModal.userId)?.name}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-slate-100 p-2 rounded-full border border-white">
                            <ArrowLeftRight className="w-5 h-5 text-slate-500" />
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">You Offer</p>
                         {currentUser && currentUser.skillsOffered.length > 0 ? (
                            <div className="flex items-center gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                                <img src={currentUser.skillsOffered[0].image} className="w-14 h-14 rounded-lg object-cover" />
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{currentUser.skillsOffered[0].title}</h4>
                                    <p className="text-xs text-slate-500">Your primary skill</p>
                                </div>
                            </div>
                         ) : (
                             <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-slate-500 text-sm">
                                 You have no skills to offer yet. Go to profile to add one.
                             </div>
                         )}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button onClick={() => setShowSwapModal(null)} className="flex-1 py-3 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition">Cancel</button>
                    <button 
                        onClick={() => handleSendRequest(showSwapModal)}
                        disabled={!currentUser || currentUser.coins < 1}
                        className={`flex-1 py-3 font-bold text-white rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                            currentUser && currentUser.coins > 0 
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                            : 'bg-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {currentUser && currentUser.coins > 0 ? 'Send Request (-1 Coin)' : 'Insufficient Coins'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
