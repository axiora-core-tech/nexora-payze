import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { Building2, Plus, Copy, ExternalLink, Check, Search, Users, Video, Calendar, ArrowRight, Crown, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { tenantService, bookingService } from "../../services";
import type { Tenant } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { RowSkeleton, ErrorState } from "../components/Loaders";

const INDUSTRIES = ['E-commerce', 'SaaS', 'Financial Services', 'Travel & Hospitality', 'Creative Agency', 'Healthcare', 'Education', 'Marketplace', 'Other'];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

export function TenantsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<'tenants' | 'bookings'>('tenants');

  const tenants = useAsync(() => tenantService.list(), []);
  const bookings = useAsync(() => bookingService.list(), []);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    industry: '',
    brandColor: '#00A3FF',
    plan: 'Growth' as Tenant['plan'],
    contactName: '',
    contactEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (tenants.error) return <ErrorState message="Couldn't load tenants" onRetry={tenants.refetch} />;

  const filteredTenants = (tenants.data ?? []).filter(t =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.slug.includes(query.toLowerCase())
  );

  const handleCreate = async () => {
    if (!form.name || !form.slug || !form.contactEmail) {
      toast.error('Please fill in required fields');
      return;
    }
    if ((tenants.data ?? []).some(t => t.slug === form.slug)) {
      toast.error('This URL slug is already taken');
      return;
    }
    setSubmitting(true);
    try {
      await tenantService.create(form);
      toast.success(`${form.name} onboarded successfully`, { description: `Workspace URL: /t/${form.slug}` });
      setCreatedSlug(form.slug);
      setIsCreating(false);
      setForm({ name: '', slug: '', industry: '', brandColor: '#00A3FF', plan: 'Growth', contactName: '', contactEmail: '' });
      tenants.refetch();
    } catch {
      toast.error('Could not create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/t/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success('Tenant URL copied');
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const activate = async (t: Tenant) => {
    await tenantService.activate(t.id);
    toast.success(`${t.name} activated`);
    tenants.refetch();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 mt-4 relative">
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-bl from-[#00D4AA]/15 to-[#00A3FF]/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}>
            <Crown size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#00A3FF]">Super Admin</span>
              <Shield size={12} className="text-[#00A3FF]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Tenant Console.</h1>
            <p className="text-stone-500 max-w-lg text-lg leading-relaxed">
              Onboard new clients, manage workspaces, and track demo bookings from marketing.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="group flex items-center gap-2 px-6 py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all"
          style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}
        >
          <Plus size={18} />
          Onboard new client
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total tenants', value: tenants.data?.length ?? 0, tint: 'from-[#00D4AA]/15 to-[#00A3FF]/10' },
          { label: 'Active', value: tenants.data?.filter(t => t.status === 'Active').length ?? 0, tint: 'from-[#00A3FF]/15 to-[#7F77DD]/10' },
          { label: 'Pending', value: tenants.data?.filter(t => t.status === 'Pending').length ?? 0, tint: 'from-amber-200/25 to-amber-100/15' },
          { label: 'Demo requests', value: bookings.data?.length ?? 0, tint: 'from-[#7F77DD]/15 to-[#00D4AA]/10' },
        ].map(s => (
          <div key={s.label} className={`p-5 bg-gradient-to-br ${s.tint} rounded-[24px] border border-stone-200/40`}>
            <div className="text-3xl font-light text-stone-900 mb-1">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-stone-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-full w-fit border border-stone-200/50">
        {[
          { id: 'tenants', label: 'Client Workspaces', icon: Building2, count: tenants.data?.length },
          { id: 'bookings', label: 'Demo Requests', icon: Video, count: bookings.data?.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
              tab === t.id ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <t.icon size={16} /> {t.label}
            {typeof t.count === 'number' && <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/60 text-stone-500'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Just-created banner */}
      <AnimatePresence>
        {createdSlug && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-5 rounded-2xl border border-[#00D4AA]/30 bg-gradient-to-r from-[#00D4AA]/10 to-[#00A3FF]/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00D4AA] text-white flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="font-medium text-stone-900">Workspace ready</div>
                <div className="text-sm text-stone-600">
                  URL: <code className="bg-white/70 px-2 py-0.5 rounded font-mono text-xs">/t/{createdSlug}</code>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => copyUrl(createdSlug)} className="px-4 py-2 rounded-full bg-white text-sm font-medium border border-stone-200">
                Copy URL
              </button>
              <Link to={`/t/${createdSlug}`} className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #00D4AA, #00A3FF)" }}>
                Open workspace
              </Link>
              <button onClick={() => setCreatedSlug(null)} className="text-stone-400 hover:text-stone-600 px-2">×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TENANTS TAB */}
      {tab === 'tenants' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-stone-200/50 p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or URL slug..."
                className="bg-stone-50 border border-stone-200/50 rounded-full pl-10 pr-5 py-2.5 text-sm w-72 outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          </div>

          {tenants.loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <RowSkeleton key={i} />)}</div>
          ) : filteredTenants.length === 0 ? (
            <div className="py-16 text-center text-stone-400">No tenants match that search.</div>
          ) : (
            <div className="space-y-3">
              {filteredTenants.map(t => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group grid grid-cols-12 items-center gap-4 p-5 bg-white rounded-2xl border border-stone-200/40 hover:border-stone-300 hover:shadow-md transition-all"
                >
                  <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: t.brandColor }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-stone-900">{t.name}</div>
                      <div className="text-xs text-stone-500">{t.industry} · {t.plan}</div>
                    </div>
                  </div>

                  <div className="col-span-12 md:col-span-4 flex items-center gap-2">
                    <code className="text-xs font-mono text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/50 flex-1 truncate">
                      /t/{t.slug}
                    </code>
                    <button onClick={() => copyUrl(t.slug)} className="p-2 hover:bg-stone-100 rounded-lg transition-colors" title="Copy URL">
                      {copiedSlug === t.slug ? <Check size={14} className="text-[#00D4AA]" /> : <Copy size={14} className="text-stone-500" />}
                    </button>
                  </div>

                  <div className="col-span-6 md:col-span-2 text-sm">
                    <div className="text-stone-500 text-xs">30d GMV</div>
                    <div className="font-medium text-stone-900">${t.gmv30d.toLocaleString()}</div>
                  </div>

                  <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                      t.status === 'Active' ? 'text-emerald-700 bg-emerald-50' :
                      t.status === 'Pending' ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                    }`}>
                      {t.status}
                    </span>
                    {t.status === 'Pending' && (
                      <button onClick={() => activate(t)} className="text-xs font-medium text-[#00A3FF] hover:text-[#185FA5]">
                        Activate
                      </button>
                    )}
                    <Link to={`/t/${t.slug}`} className="p-2 hover:bg-stone-100 rounded-lg transition-colors" title="Open workspace">
                      <ExternalLink size={14} className="text-stone-500" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {tab === 'bookings' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-stone-200/50 p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6 text-stone-700">
            <Calendar size={18} />
            <h3 className="font-medium">Incoming demo requests from the marketing site</h3>
          </div>

          {bookings.loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <RowSkeleton key={i} />)}</div>
          ) : (bookings.data ?? []).length === 0 ? (
            <div className="py-20 text-center">
              <Video size={36} className="text-stone-300 mx-auto mb-3" />
              <div className="text-stone-400 text-sm">No demo bookings yet.</div>
              <div className="text-stone-400 text-xs mt-1">When a visitor books from the home page, they'll appear here.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.data!.map(b => (
                <div key={b.id} className="grid grid-cols-12 items-center gap-4 p-5 bg-white rounded-2xl border border-stone-200/40">
                  <div className="col-span-12 md:col-span-4">
                    <div className="font-medium text-stone-900">{b.name}</div>
                    <div className="text-xs text-stone-500">{b.email} · {b.company}</div>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-sm">
                    <div className="text-stone-700 font-medium">{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="text-xs text-stone-500">{b.time} · {b.timezone}</div>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-sm">
                    <div className="text-xs text-stone-400 uppercase tracking-wider">Zoom ID</div>
                    <code className="font-mono text-xs text-stone-700">{b.zoomMeetingId}</code>
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-emerald-700 bg-emerald-50">
                      {b.status}
                    </span>
                    <a href={b.zoomJoinUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-stone-100 rounded-lg">
                      <ExternalLink size={14} className="text-stone-500" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreating(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-stone-100 sticky top-0 bg-white z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-light text-stone-900 mb-1">Onboard new client</h2>
                    <p className="text-sm text-stone-500">Each tenant gets their own URL and isolated workspace.</p>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
                </div>
              </div>

              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Company name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm(f => ({ ...f, name, slug: f.slug || slugify(name) }));
                    }}
                    placeholder="Acme Corporation"
                    className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A3FF]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Workspace URL slug *</label>
                  <div className="flex items-stretch">
                    <span className="flex items-center px-4 bg-stone-100 border border-stone-200/50 border-r-0 rounded-l-xl text-sm text-stone-500 font-mono">
                      payze.com/t/
                    </span>
                    <input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                      placeholder="acme-corp"
                      className="flex-1 bg-stone-50 border border-stone-200/50 rounded-r-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A3FF]/30 font-mono text-sm"
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-1.5">Lowercase, hyphens only. Customers log in at this URL.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Industry</label>
                    <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A3FF]/30">
                      <option value="">Select...</option>
                      {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Plan</label>
                    <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as Tenant['plan'] })}
                      className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A3FF]/30">
                      <option value="Starter">Starter · $499/mo</option>
                      <option value="Growth">Growth · $2,499/mo</option>
                      <option value="Scale">Scale · $9,999/mo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">Brand color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                      className="w-16 h-12 rounded-xl border border-stone-200/50 cursor-pointer" />
                    <input value={form.brandColor} onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-[#00A3FF]/30" />
                  </div>
                </div>

                <div className="pt-5 border-t border-stone-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-4">Primary contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-2">Name</label>
                      <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        placeholder="Sarah Connor"
                        className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A3FF]/30" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-2">Email *</label>
                      <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                        placeholder="sarah@acme.com"
                        className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#00A3FF]/30" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-between">
                <button onClick={() => setIsCreating(false)} className="px-5 py-3 rounded-full text-stone-600 hover:bg-stone-100 text-sm font-medium">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={submitting}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-white font-medium disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #00D4AA, #00A3FF)" }}>
                  {submitting ? 'Creating...' : <>Create workspace <ArrowRight size={16} /></>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
