import React, { useState, useEffect } from 'react';
import { store } from '../services/mockStore';
import { Swap, SwapStatus } from '../types';
import { Clock, CheckCircle, XCircle, ArrowRight, Layout, MessageSquare, Briefcase, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CollaborationWorkspace from '../components/CollaborationWorkspace';

const SwapProgress: React.FC = () => {
  const currentUser = store.getCurrentUser();
  const navigate = useNavigate();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'history'>('active');
  const [workspaceSwap, setWorkspaceSwap] = useState<Swap | null>(null);

  useEffect(() => {
    if (currentUser) {
      setSwaps(store.getSwapsForUser(currentUser.id));
    }
  }, [currentUser]);

  if (!currentUser) return <div>Please login.</div>;

  const activeSwaps = swaps.filter(s => s.status === SwapStatus.ACCEPTED);
  const pendingSwaps = swaps.filter(s => s.status === SwapStatus.PENDING);
  const historySwaps = swaps.filter(s => s.status === SwapStatus.COMPLETED || s.status === SwapStatus.DECLINED || s.status === SwapStatus.CANCELLED);

  const getPartner = (swap: Swap) => {
      const id = swap.requesterId === currentUser.id ? swap.receiverId : swap.requesterId;
      return store.getUserById(id);
  }

  const getMyRole = (swap: Swap) => {
      return swap.requesterId === currentUser.id ? 'requester' : 'receiver';
  }

  const handleDecline = (id: string) => {
      store.declineSwap(id);
      // Refresh local state
      setSwaps(store.getSwapsForUser(currentUser.id));
  };

  const handleAccept = (id: string) => {
      store.acceptSwap(id);
      setSwaps(store.getSwapsForUser(currentUser.id));
      setActiveTab('active');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Swap Progress</h1>
                <p className="text-slate-500 mt-1">Manage your exchanges, track milestones, and collaborate.</p>
            </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-lg"><Layout className="w-6 h-6" /></div>
                    <span className="text-2xl font-bold">{activeSwaps.length}</span>
                </div>
                <h3 className="font-semibold opacity-90">Active Swaps</h3>
                <p className="text-sm opacity-70 mt-1">Currently in progress</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-6 h-6" /></div>
                    <span className="text-2xl font-bold text-slate-800">{pendingSwaps.length}</span>
                </div>
                <h3 className="font-semibold text-slate-700">Pending Requests</h3>
                <p className="text-sm text-slate-500 mt-1">Waiting for action</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
                    <span className="text-2xl font-bold text-slate-800">{historySwaps.filter(s => s.status === SwapStatus.COMPLETED).length}</span>
                </div>
                <h3 className="font-semibold text-slate-700">Completed</h3>
                <p className="text-sm text-slate-500 mt-1">Lifetime swaps finished</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
            <div className="flex gap-8">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`pb-4 px-2 text-sm font-bold transition border-b-2 ${activeTab === 'active' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    In Progress ({activeSwaps.length})
                </button>
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`pb-4 px-2 text-sm font-bold transition border-b-2 ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Pending Requests ({pendingSwaps.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`pb-4 px-2 text-sm font-bold transition border-b-2 ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    History
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
            {(activeTab === 'active' ? activeSwaps : activeTab === 'pending' ? pendingSwaps : historySwaps).length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">No swaps found in this category.</p>
                </div>
            )}

            {(activeTab === 'active' ? activeSwaps : activeTab === 'pending' ? pendingSwaps : historySwaps).map(swap => {
                const partner = getPartner(swap);
                const offeredSkill = store.getSkillById(swap.offeredSkillId);
                const requestedSkill = store.getSkillById(swap.requestedSkillId);
                const isRequester = getMyRole(swap) === 'requester';

                return (
                    <div key={swap.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
                        {/* Partner Info */}
                        <div className="flex items-center gap-4 w-full md:w-1/4">
                            <img src={partner?.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-slate-100" />
                            <div>
                                <h3 className="font-bold text-slate-800">{partner?.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Started {new Date(swap.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Swap Details */}
                        <div className="flex-1 w-full bg-slate-50 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 relative">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">You Give</p>
                                <p className="font-semibold text-slate-800 text-sm">
                                    {isRequester ? offeredSkill?.title : requestedSkill?.title}
                                </p>
                            </div>
                            
                            <div className="bg-white p-2 rounded-full shadow-sm z-10">
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                            </div>

                            <div className="flex-1 text-center md:text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">You Get</p>
                                <p className="font-semibold text-indigo-700 text-sm">
                                    {isRequester ? requestedSkill?.title : offeredSkill?.title}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full md:w-auto flex flex-col gap-2 min-w-[140px]">
                            {activeTab === 'active' && (
                                <>
                                    <button 
                                        onClick={() => setWorkspaceSwap(swap)}
                                        className="w-full py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Briefcase className="w-4 h-4" /> Workspace
                                    </button>
                                    <button 
                                        onClick={() => navigate('/messages')}
                                        className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Chat
                                    </button>
                                </>
                            )}
                            
                            {activeTab === 'pending' && (
                                <>
                                    {!isRequester ? (
                                        <>
                                            <button 
                                                onClick={() => handleAccept(swap.id)}
                                                className="w-full py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition"
                                            >
                                                Accept Request
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(swap.id)}
                                                className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">Waiting for approval</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'history' && (
                                <div className="text-center w-full">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                        swap.status === SwapStatus.COMPLETED 
                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                        {swap.status}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Live Workspace Modal */}
        {workspaceSwap && (
            <CollaborationWorkspace 
                isOpen={!!workspaceSwap} 
                onClose={() => setWorkspaceSwap(null)}
                partnerName={getPartner(workspaceSwap)?.name || 'Partner'}
            />
        )}
    </div>
  );
};

export default SwapProgress;