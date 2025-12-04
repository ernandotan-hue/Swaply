import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Paperclip, MoreVertical, Phone, Video, Check, CheckCheck, Smile, Sparkles, MessageSquare, Briefcase, Award, ShieldAlert, CheckCircle } from 'lucide-react';
import { store } from '../services/mockStore';
import { Swap, Message, SwapStatus } from '../types';
import { generateIcebreaker } from '../services/geminiService';

const Chat: React.FC = () => {
  const currentUser = store.getCurrentUser();
  const [activeSwap, setActiveSwap] = useState<Swap | null>(null);
  const [messageText, setMessageText] = useState('');
  const [mySwaps, setMySwaps] = useState<Swap[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [refresh, setRefresh] = useState(0); // Trigger re-render

  useEffect(() => {
    if (currentUser) {
      const swaps = store.getSwapsForUser(currentUser.id);
      setMySwaps(swaps);
      // Auto-select most recent or existing selection
      if (swaps.length > 0 && !activeSwap) {
        // Sort by last update
        const sorted = [...swaps].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setActiveSwap(sorted[0]);
      } else if (activeSwap) {
          // Update active swap reference if data changed
          const found = swaps.find(s => s.id === activeSwap.id);
          if (found) setActiveSwap(found);
      }
    }
  }, [currentUser, refresh]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSwap?.messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeSwap || !currentUser) return;

    store.sendMessage(activeSwap.id, currentUser.id, messageText);
    setMessageText('');
    setRefresh(r => r + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAiIcebreaker = async () => {
      if (!activeSwap || !currentUser) return;
      setAiLoading(true);
      const otherUserId = activeSwap.requesterId === currentUser.id ? activeSwap.receiverId : activeSwap.requesterId;
      const mySkill = store.getSkillById(activeSwap.offeredSkillId)?.title || "Skill";
      const theirSkill = store.getSkillById(activeSwap.requestedSkillId)?.title || "Skill";

      const suggestion = await generateIcebreaker(mySkill, theirSkill);
      setMessageText(suggestion);
      setAiLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeSwap && currentUser) {
          const fakeUrl = URL.createObjectURL(file);
          store.sendMessage(activeSwap.id, currentUser.id, "Sent an image", fakeUrl);
          setRefresh(r => r + 1);
      }
  };

  const handleAcceptSwap = (swapId: string) => {
      const result = store.acceptSwap(swapId);
      if (!result.success) {
          alert(result.message); // Alert for locking logic
      }
      setRefresh(r => r + 1);
  };

  const handleDeclineSwap = (swapId: string) => {
      store.declineSwap(swapId);
      setRefresh(r => r + 1);
  };

  const handleCompleteSwap = (swapId: string) => {
      if (confirm("Are you sure the swap is complete? This will award points to both users.")) {
        store.completeSwap(swapId);
        setRefresh(r => r + 1);
      }
  };

  if (!currentUser) return <div className="p-8 text-center text-slate-500">Please login to view messages.</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-slate-200 flex flex-col ${activeSwap ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mySwaps.length === 0 ? (
             <div className="p-4 text-center text-slate-400 text-sm mt-10">No active swaps yet.</div>
          ) : (
            mySwaps.map(swap => {
                const otherUserId = swap.requesterId === currentUser.id ? swap.receiverId : swap.requesterId;
                const otherUser = store.getUserById(otherUserId);
                const lastMsg = swap.messages[swap.messages.length - 1];
                
                return (
                    <div 
                        key={swap.id}
                        onClick={() => setActiveSwap(swap)}
                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 ${activeSwap?.id === swap.id ? 'bg-indigo-50/50' : ''}`}
                    >
                        <div className="relative">
                            <img src={otherUser?.avatar} alt={otherUser?.name} className="w-12 h-12 rounded-full object-cover" />
                            {otherUser?.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-semibold text-slate-800 truncate">{otherUser?.name}</h3>
                                <span className="text-xs text-slate-400">{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                            </div>
                            <p className="text-sm text-slate-500 truncate">
                                {lastMsg ? (
                                    lastMsg.type === 'system' ? '🔔 System Notification' : 
                                    lastMsg.type === 'swap_request' ? '📄 Swap Request' :
                                    lastMsg.type === 'image' ? '📷 Image' : lastMsg.text
                                ) : 'Start chatting!'}
                            </p>
                        </div>
                    </div>
                );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeSwap ? (
        <div className={`flex-1 flex flex-col ${!activeSwap ? 'hidden md:flex' : 'flex'}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveSwap(null)} className="md:hidden text-slate-500 hover:text-slate-800">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {(() => {
                        const otherUserId = activeSwap.requesterId === currentUser.id ? activeSwap.receiverId : activeSwap.requesterId;
                        const otherUser = store.getUserById(otherUserId);
                        return (
                            <>
                                <img src={otherUser?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        {otherUser?.name}
                                        {activeSwap.status === SwapStatus.ACCEPTED && (
                                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">Active Swap</span>
                                        )}
                                        {activeSwap.status === SwapStatus.COMPLETED && (
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Completed</span>
                                        )}
                                    </h3>
                                    <span className="text-xs text-green-600 font-medium">{otherUser?.isOnline ? 'Online' : 'Offline'}</span>
                                </div>
                            </>
                        )
                    })()}
                </div>
                <div className="flex items-center gap-4">
                    {activeSwap.status === SwapStatus.ACCEPTED && (
                        <button 
                            onClick={() => handleCompleteSwap(activeSwap.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 shadow-md"
                        >
                            <CheckCircle className="w-3 h-3" /> Complete Swap
                        </button>
                    )}
                    <div className="flex text-slate-400 gap-3">
                        <Phone className="w-5 h-5 hover:text-indigo-600 cursor-pointer transition" />
                        <Video className="w-5 h-5 hover:text-indigo-600 cursor-pointer transition" />
                        <MoreVertical className="w-5 h-5 hover:text-indigo-600 cursor-pointer transition" />
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/30 bg-opacity-50 relative">
                
                {activeSwap.messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    const isSystem = msg.type === 'system';
                    const isSwapRequest = msg.type === 'swap_request';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <div className="bg-slate-200/80 text-slate-600 text-xs py-1.5 px-4 rounded-full font-medium shadow-sm">
                                    {msg.text}
                                </div>
                            </div>
                        );
                    }

                    if (isSwapRequest) {
                        // Retrieve details for the card
                        const offerSkill = store.getSkillById(activeSwap.offeredSkillId);
                        const requestSkill = store.getSkillById(activeSwap.requestedSkillId);
                        const requester = store.getUserById(activeSwap.requesterId);
                        const isReceiver = currentUser.id === activeSwap.receiverId;

                        return (
                            <div key={msg.id} className="flex justify-center my-6">
                                <div className="bg-white border border-indigo-100 rounded-2xl shadow-lg p-5 max-w-sm w-full relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
                                    
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-indigo-600" /> Skill Swap Proposal
                                        </h4>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${activeSwap.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : activeSwap.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {activeSwap.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Offer Side */}
                                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                                             <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Offered by {requester?.name}</p>
                                                <p className="font-bold text-indigo-700 text-sm">{offerSkill?.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">Lvl: {offerSkill?.level}</span>
                                                    <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">Exp: {offerSkill?.experience}y</span>
                                                </div>
                                             </div>
                                        </div>

                                        <div className="flex justify-center -my-2 relative z-10">
                                            <div className="bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                            </div>
                                        </div>

                                        {/* Request Side */}
                                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Requested</p>
                                                <p className="font-bold text-slate-800 text-sm">{requestSkill?.title}</p>
                                            </div>
                                        </div>

                                        {isReceiver && activeSwap.status === SwapStatus.PENDING && (
                                            <div className="pt-3 border-t border-slate-50 flex gap-2">
                                                <button 
                                                    onClick={() => handleDeclineSwap(activeSwap.id)}
                                                    className="flex-1 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium transition"
                                                >
                                                    Decline
                                                </button>
                                                <button 
                                                    onClick={() => handleAcceptSwap(activeSwap.id)}
                                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md"
                                                >
                                                    Accept Swap
                                                </button>
                                            </div>
                                        )}
                                        
                                        {!isReceiver && activeSwap.status === SwapStatus.PENDING && (
                                             <div className="pt-3 border-t border-slate-50 text-center text-xs text-slate-400 italic">
                                                Waiting for {store.getUserById(activeSwap.receiverId)?.name} to accept...
                                             </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] md:max-w-[60%] rounded-lg p-3 shadow-sm relative group ${isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="Attachment" className="rounded-lg mb-2 max-w-full h-auto object-cover" />
                                )}
                                <p className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {isMe && (
                                        <CheckCheck className="w-3 h-3 text-blue-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Helper UI when chat is empty but swap is active (rare but possible) */}
                {activeSwap.messages.length === 0 && (
                     <div className="text-center mt-10">
                         <p className="text-slate-500 text-sm">Use AI to break the ice.</p>
                         <button 
                            onClick={handleAiIcebreaker}
                            disabled={aiLoading}
                            className="mt-2 flex items-center gap-2 mx-auto text-indigo-600 bg-white border border-indigo-200 px-4 py-2 rounded-full hover:bg-indigo-50 transition shadow-sm text-sm font-medium"
                         >
                            {aiLoading ? <span className="animate-spin">⌛</span> : <Sparkles className="w-4 h-4" />}
                            Suggest Opener
                         </button>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Disabled if swap is Completed or Cancelled */}
            {activeSwap.status === SwapStatus.COMPLETED ? (
                <div className="p-4 bg-slate-50 text-center border-t border-slate-200">
                    <p className="text-sm font-bold text-green-600 flex items-center justify-center gap-2">
                        <Award className="w-5 h-5" /> Swap Completed! Conversation Closed.
                    </p>
                </div>
            ) : (
                <div className="p-3 bg-white border-t border-slate-200 flex items-end gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 min-h-[44px]">
                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message"
                            className="w-full bg-transparent border-none outline-none text-slate-800 resize-none h-6 text-sm py-1 no-scrollbar"
                            rows={1}
                        />
                        <button className="ml-2 text-slate-400 hover:text-slate-600">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    {messageText.trim() || aiLoading ? (
                        <button 
                            onClick={handleSendMessage}
                            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md flex items-center justify-center"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    ) : (
                        <button className="p-3 bg-slate-200 text-slate-400 rounded-full cursor-default">
                            <div className="w-5 h-5" /> {/* Placeholder size */}
                        </button>
                    )}
                </div>
            )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col bg-slate-50 text-slate-400">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-600">Select a chat to start messaging</h3>
            <p className="text-sm">Swap skills to unlock conversations.</p>
        </div>
      )}
    </div>
  );
};

export default Chat;