import React, { useEffect, useState } from 'react';
import { 
  Send, 
  Clock, 
  Handshake, 
  CheckCircle2, 
  Filter, 
  Search,
  ArrowRight,
  BookOpen,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Activity,
  Loader2
} from 'lucide-react';
import { RequestItem, RequestStatus } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const styles = {
    'Sent': 'bg-status-sent-bg text-status-sent-text',
    'In Progress': 'bg-status-progress-bg text-status-progress-text',
    'Received': 'bg-status-received-bg text-status-received-text',
    'Completed': 'bg-status-completed-bg text-status-completed-text',
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", styles[status])}>
      {status}
    </span>
  );
};

export const Dashboard = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch requests');
        }
        
        setRequests(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Could not load requests. Please check your Dataverse connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStats = () => {
    const counts = {
      'Sent': requests.filter(r => r.status === 'Sent').length,
      'In Progress': requests.filter(r => r.status === 'In Progress').length,
      'Received': requests.filter(r => r.status === 'Received').length,
      'Completed': requests.filter(r => r.status === 'Completed').length,
    };

    return [
      { label: 'Sent', value: counts['Sent'].toString().padStart(2, '0'), icon: Send, color: 'text-status-sent-text' },
      { label: 'In Progress', value: counts['In Progress'].toString().padStart(2, '0'), icon: Clock, color: 'text-on-primary', bg: 'bg-primary-container' },
      { label: 'Received', value: counts['Received'].toString().padStart(2, '0'), icon: Handshake, color: 'text-secondary' },
      { label: 'Completed', value: counts['Completed'].toString().padStart(2, '0'), icon: CheckCircle2, color: 'text-status-completed-text', border: 'border-l-4 border-status-completed-text' },
    ];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-on-surface-variant animate-pulse">Connecting to Dataverse...</p>
      </div>
    );
  }

  if (error) {
    const isConfigError = error.includes('Missing configuration');
    
    return (
      <div className="bg-error-container text-on-error-container p-8 rounded-xl architectural-shadow">
        <h3 className="text-xl font-bold mb-2">Dataverse Connection Error</h3>
        <p className="mb-4">{error}</p>
        
        {isConfigError ? (
          <div className="bg-surface-container-lowest/20 p-4 rounded-lg text-sm space-y-2 border border-on-error-container/20">
            <p className="font-bold">Required Environment Variables:</p>
            <ul className="list-disc list-inside opacity-90">
              <li>MICROSOFT_TENANT_ID</li>
              <li>MICROSOFT_CLIENT_ID</li>
              <li>MICROSOFT_CLIENT_SECRET</li>
              <li>DATAVERSE_URL</li>
            </ul>
            <p className="mt-4 text-xs italic">Please set these in the AI Studio Secrets panel.</p>
          </div>
        ) : (
          <p className="text-sm opacity-80">This might be due to incorrect credentials, network issues, or Dataverse API limitations.</p>
        )}
        
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-on-error-container text-error-container rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl md:text-5xl font-bold text-on-surface tracking-tight mb-2">Executive Overview</h2>
        <p className="text-on-surface-variant">Manage and monitor your enterprise resource requests.</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className={cn(
              "p-6 rounded-xl flex flex-col justify-between min-h-[140px] architectural-shadow",
              stat.bg || "bg-surface-container-lowest",
              stat.border
            )}
          >
            <div className="flex justify-between items-start">
              <span className={cn("text-[10px] uppercase tracking-widest font-bold", stat.bg ? "opacity-80" : "text-on-surface-variant")}>
                {stat.label}
              </span>
              <stat.icon className={cn(stat.color)} size={20} />
            </div>
            <div className={cn("text-4xl font-bold", stat.bg ? "text-on-primary" : "text-on-surface")}>
              {stat.value}
            </div>
          </div>
        ))}
      </section>

      {/* Table Section */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden ghost-border">
        <div className="px-8 py-6 flex items-center justify-between bg-surface-container-low/50">
          <h3 className="text-lg font-bold text-on-surface">My Requests</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
              <Filter size={18} />
            </button>
            <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
              <Search size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Request ID</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Type</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Status</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Date Submitted</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant italic">
                    No requests found in Dataverse.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-8 py-5 text-sm font-semibold text-on-surface">{req.id}</td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">{req.type}</td>
                    <td className="px-8 py-5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">
                      {new Date(req.submittedOn || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <Link to={`/requests/${req.id}`} className="text-primary hover:underline text-sm font-medium">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-8 py-4 bg-surface-container-low/30 flex justify-between items-center">
          <p className="text-xs text-on-surface-variant">Showing {requests.length} requests</p>
          <div className="flex gap-4">
            <button className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary transition-colors">Previous</button>
            <button className="text-xs font-bold uppercase tracking-widest text-primary">Next</button>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 relative overflow-hidden rounded-xl bg-surface-container-low p-8 ghost-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
          <h4 className="text-lg font-bold mb-6 text-on-surface">System Performance Insights</h4>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full border-[10px] border-primary border-t-transparent flex items-center justify-center">
              <span className="text-2xl font-bold">88%</span>
            </div>
            <div>
              <p className="text-on-surface font-semibold mb-2">SLA Compliance Rate</p>
              <p className="text-sm text-on-surface-variant max-w-sm mb-4">
                Your requests are being processed ahead of the average organizational timeline. Keep up the high-quality documentation in your submissions.
              </p>
              <button className="text-sm font-bold text-primary flex items-center gap-1 group">
                View detailed report 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high rounded-xl p-8">
          <h4 className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-6">Support Center</h4>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm">
                <BookOpen className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Documentation</p>
                <p className="text-xs text-on-surface-variant">How to submit catalog requests.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm">
                <MessageSquare className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Live Chat</p>
                <p className="text-xs text-on-surface-variant">Talk to the admin team now.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const AdminOverview = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch requests');
        }
        
        setRequests(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Could not load admin data. Please check your Dataverse connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const adminStats = [
    { label: 'Pending Review', value: requests.filter(r => r.status === 'Sent').length.toString(), icon: Activity, trend: '+12% from yesterday', trendIcon: TrendingUp },
    { label: 'Active Operations', value: requests.filter(r => r.status === 'In Progress').length.toString(), icon: Activity, trend: 'Normal latency' },
    { label: 'Completed Today', value: requests.filter(r => r.status === 'Completed').length.toString(), icon: CheckCircle2, trend: 'Goal: 100' },
    { label: 'System Health', value: '99.9%', icon: ShieldCheck, trend: 'Optimized' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-on-surface-variant animate-pulse">Loading Admin Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-8 rounded-xl architectural-shadow">
        <h3 className="text-xl font-bold mb-2">Admin Data Error</h3>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-on-error-container text-error-container rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Admin Overview</h2>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {adminStats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-xl ghost-border flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-medium text-on-surface-variant">{stat.label}</p>
              <h3 className="text-4xl font-bold text-on-surface mt-1">{stat.value}</h3>
            </div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mt-4">
              {stat.trendIcon && <stat.trendIcon size={14} />}
              <span>{stat.trend}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Admin Table Controls */}
      <section className="bg-surface-container-low p-6 rounded-t-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-medium text-on-surface-variant">Filter by Status</label>
            <select className="bg-surface-container-lowest border-none rounded-sm text-sm py-2 px-4 focus:ring-2 focus:ring-primary">
              <option>All Statuses</option>
              <option>Sent</option>
              <option>Received</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider font-medium text-on-surface-variant">Request Type</label>
            <select className="bg-surface-container-lowest border-none rounded-sm text-sm py-2 px-4 focus:ring-2 focus:ring-primary">
              <option>All Types</option>
              <option>Pricing</option>
              <option>Material Info</option>
              <option>Spares</option>
              <option>Catalog</option>
            </select>
          </div>
        </div>
        <button className="bg-surface-container-high px-4 py-2 text-primary font-semibold text-sm rounded-lg hover:bg-surface-container-highest transition-colors flex items-center gap-2">
          <Send size={16} />
          Export Data
        </button>
      </section>

      <section className="bg-surface-container-lowest rounded-b-xl overflow-hidden shadow-sm ghost-border">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-high">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant">Requester</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant">Request Type</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-medium text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold">
                      {req.requester?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{req.requester || 'User'}</p>
                      <p className="text-[11px] text-on-surface-variant">{req.requesterRole || 'Employee'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-on-surface font-medium">{req.title}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-primary font-semibold text-xs hover:underline inline-flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                    Assign To
                    <ArrowRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
