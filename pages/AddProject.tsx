
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FolderPlus, UploadCloud } from 'lucide-react';
import { store } from '../services/mockStore';
import { SkillCategory } from '../types';

const AddProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      requirements: '',
      category: SkillCategory.OTHER,
      fileUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const user = store.getCurrentUser();
      if (!user) return;

      setLoading(true);
      setTimeout(() => {
          store.addProject(user.id, {
              ...formData,
              fileUrl: formData.fileUrl || '#' // Mock file
          });
          setLoading(false);
          navigate('/projects');
      }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-slate-800">Add Project</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
                <input 
                    type="text" 
                    required
                    placeholder="e.g. E-Commerce Website Template"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
            </div>

            <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                 <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as SkillCategory})}
                 >
                    {Object.values(SkillCategory).map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea 
                    required
                    rows={4}
                    placeholder="Describe the project, what technologies were used, etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Requirements / What you want in return</label>
                <textarea 
                    required
                    rows={2}
                    placeholder="e.g. I want to swap this for a Python script or a logo design."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                    value={formData.requirements}
                    onChange={e => setFormData({...formData, requirements: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Files</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer flex flex-col items-center gap-2">
                    <UploadCloud className="w-8 h-8 text-slate-300" />
                    <span className="text-slate-500">Click to upload .zip, .pdf, or .docx</span>
                    <span className="text-xs text-slate-400">(Mock: File will be simulated)</span>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
                {loading ? 'Posting...' : (
                    <>
                        <FolderPlus className="w-5 h-5" /> Post Project
                    </>
                )}
            </button>

        </form>
    </div>
  );
};

export default AddProject;
