import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Info, 
  ShieldCheck,
  ChevronRight,
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export const NewRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Pricing',
    priority: 'Medium',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }
      
      // Navigate back to dashboard on success
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert(`Error creating request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-4 uppercase tracking-widest font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Requests</Link>
          <ChevronRight size={14} />
          <span className="text-on-surface">New Submission</span>
        </nav>
        <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Create New Request</h2>
        <p className="text-on-surface-variant mt-2">Initiate a formal enterprise request for catalog items, pricing, or material information.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Primary Details */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Primary Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Request Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm font-medium text-on-surface"
                  >
                    <option>Pricing</option>
                    <option>Material Info</option>
                    <option>Spares</option>
                    <option>Catalog</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm font-medium text-on-surface"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Title / Summary</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm" 
                    placeholder="Brief descriptive title"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1">Description</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary text-sm" 
                    placeholder="Provide detailed context for your request..." 
                    rows={5}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Attachments */}
            <section className="bg-surface-container-low p-8 rounded-xl">
              <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Documentation & Attachments
              </h3>
              
              <div className="border-2 border-dashed border-outline-variant/30 rounded-xl p-10 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-high/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="text-primary" size={24} />
                </div>
                <p className="text-sm font-semibold text-on-surface">Click to upload or drag and drop</p>
                <p className="text-xs text-on-surface-variant mt-1">PDF, XLSX, or PNG (Max 10MB per file)</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg shadow-sm ghost-border">
                  <div className="flex items-center gap-3">
                    <FileText className="text-tertiary" size={20} />
                    <div className="leading-tight">
                      <p className="text-sm font-medium">specifications_sheet_v2.pdf</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">1.4 MB • Complete</p>
                    </div>
                  </div>
                  <button type="button" className="p-1 hover:bg-error-container/20 rounded text-error transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-end gap-4 pt-4">
              <Link 
                to="/"
                className="px-8 py-3 bg-surface-container-high text-primary font-semibold rounded-lg hover:bg-surface-dim transition-colors text-sm"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={loading}
                className="px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm flex items-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl ghost-border space-y-6 shadow-sm">
            <h4 className="font-bold text-on-surface">Submission Guide</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Info className="text-primary shrink-0" size={20} />
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-1">Response SLAs</strong>
                  Pricing requests are typically processed within 48 business hours. Spares and catalog info may take up to 72 hours.
                </div>
              </div>
              <div className="flex gap-4">
                <ShieldCheck className="text-primary shrink-0" size={20} />
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface block mb-1">Confidentiality</strong>
                  All submitted materials are governed by corporate privacy policies and internal governance standards.
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-outline-variant/15">
              <h4 className="font-bold text-on-surface text-sm mb-4">Request Preview</h4>
              <div className="aspect-video w-full rounded-lg bg-surface-container-low overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/abstract/400/225" 
                  alt="Preview" 
                  className="w-full h-full object-cover opacity-50 grayscale"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant italic mt-3 text-center">A draft is automatically saved every 60 seconds.</p>
            </div>
          </div>

          <div className="bg-primary text-on-primary p-6 rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2">Need Assistance?</h4>
              <p className="text-xs opacity-90 leading-relaxed mb-4">Our internal support team is available 24/7 for urgent enterprise requests.</p>
              <button className="text-xs font-bold underline hover:no-underline">Connect with Support</button>
            </div>
            <Plus className="absolute -right-4 -bottom-4 opacity-10 w-32 h-32" />
          </div>
        </div>
      </div>
    </div>
  );
};
