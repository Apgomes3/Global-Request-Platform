import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  Mail, 
  FileText, 
  Download,
  History,
  AlertCircle,
  MoreHorizontal,
  HelpCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { RequestItem, RequestStatus } from '../types';
import { cn } from '../lib/utils';

export const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, actRes] = await Promise.all([
          fetch(`/api/requests/${id}`),
          fetch(`/api/requests/${id}/activities`)
        ]);

        const reqData = await reqRes.json();
        if (!reqRes.ok) {
          throw new Error(reqData.error || 'Failed to fetch request details');
        }
        setRequest(reqData);

        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData);
        } else {
          const actData = await actRes.json();
          console.warn('Activities fetch failed:', actData.error);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Could not load request details. Please check your Dataverse connection.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-on-surface-variant animate-pulse">Fetching details from Dataverse...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="bg-error-container text-on-error-container p-8 rounded-xl architectural-shadow">
        <h3 className="text-xl font-bold mb-2">Error</h3>
        <p>{error || 'Request not found.'}</p>
        <Link 
          to="/"
          className="mt-4 inline-block px-6 py-2 bg-on-error-container text-error-container rounded-lg font-bold"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-primary font-medium hover:underline transition-all">
            <ArrowLeft size={18} />
            <span>Back to List</span>
          </Link>
          <div className="h-6 w-[1px] bg-outline-variant/30 mx-2"></div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Request ID: {request.id}</h2>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-8">
          {/* Hero Section */}
          <section className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                    {request.status}
                  </span>
                  <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">{request.title}</h3>
                  <p className="text-on-surface-variant mt-2 max-w-2xl">
                    Submitted on {new Date(request.submittedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-surface-container-lowest hover:bg-surface-container text-primary px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
                    Approve Request
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-8 pt-6 border-t border-outline-variant/20">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Requester</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center text-[10px] font-bold text-on-tertiary-fixed-variant">
                      {request.requester?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                    <p className="text-sm font-semibold text-on-surface">{request.requester || 'User'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Request Type</p>
                  <p className="text-sm font-semibold text-on-surface">{request.type}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Priority</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", request.priority === 'High' ? 'bg-error' : 'bg-primary')} />
                    <p className="text-sm font-semibold text-on-surface">{request.priority} Priority</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-surface-container-lowest p-8 rounded-xl ghost-border">
            <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <FileText size={18} />
              Detailed Description
            </h4>
            <div className="text-on-surface-variant leading-relaxed">
              <p>{request.description}</p>
            </div>
          </section>

          {/* Attachments */}
          <section className="bg-surface-container-lowest p-8 rounded-xl ghost-border">
            <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <Download size={18} />
              Supporting Attachments
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <p className="text-xs text-on-surface-variant italic col-span-2">No attachments available for this request.</p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-8">
          <section className="bg-surface-container-lowest p-6 rounded-xl ghost-border">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Assigned Specialist</h4>
            <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg">
              <img 
                src="https://picsum.photos/seed/specialist/100/100" 
                alt="Specialist" 
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Marcus Sterling</p>
                <p className="text-[10px] text-on-surface-variant">Cloud Infrastructure Engineer</p>
              </div>
              <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-6 rounded-xl ghost-border">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Activity Timeline</h4>
            <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant/30">
              {activities.length === 0 ? (
                <p className="text-[10px] text-on-surface-variant italic pl-10">No activities recorded yet.</p>
              ) : (
                activities.map((activity, idx) => (
                  <div key={idx} className="relative pl-10">
                    <span className="absolute left-0 w-6 h-6 bg-primary-container text-on-primary rounded-full flex items-center justify-center z-10">
                      {activity.type === 'Created' ? <History size={14} /> : <CheckCircle size={14} />}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{activity.desc}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {new Date(activity.date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-surface-container-high p-6 rounded-xl border border-outline-variant/10">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Management Console</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-surface-container-lowest hover:bg-white rounded-lg group transition-all">
                <span className="text-xs font-semibold text-on-surface">Mark as Completed</span>
                <CheckCircle className="text-on-surface-variant group-hover:text-primary" size={18} />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-surface-container-lowest hover:bg-white rounded-lg group transition-all">
                <span className="text-xs font-semibold text-on-surface">Request More Info</span>
                <HelpCircle className="text-on-surface-variant group-hover:text-tertiary" size={18} />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-surface-container-lowest hover:bg-white rounded-lg group transition-all">
                <span className="text-xs font-semibold text-error">Decline Request</span>
                <XCircle className="text-error" size={18} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
