import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Activity, DollarSign, TrendingUp } from "lucide-react";
import { adminService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { CardSkeleton, Skeleton, ErrorState } from "../components/Loaders";

const iconMap: Record<string, any> = { Users, Activity, DollarSign, TrendingUp };

export function AdminDashboard() {
  const { data, loading, error, refetch } = useAsync(() => adminService.getDashboard(), []);

  if (error) return <ErrorState message="Couldn't load admin dashboard" onRetry={refetch} />;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-stone-900 mb-2">Platform Overview</h1>
          <p className="text-stone-500">Real-time metrics for FinTech Revolution.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-stone-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-stone-700">Live Services</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !data ? (
          <>
            <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          </>
        ) : (
          data.kpis.map((kpi: any, idx: number) => {
            const Icon = iconMap[kpi.icon] || Activity;
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-white/80 backdrop-blur-md rounded-[32px] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-sm font-medium ${kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {kpi.trend}
                  </span>
                </div>
                <div>
                  <p className="text-stone-500 text-sm mb-1">{kpi.title}</p>
                  <h3 className="text-3xl font-medium tracking-tight text-stone-800">{kpi.value}</h3>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 bg-white/80 backdrop-blur-md rounded-[40px] border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
      >
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-xl font-medium text-stone-800">Volume & Flow</h3>
            <p className="text-stone-500 text-sm mt-1">Daily transaction throughput (7 days)</p>
          </div>
          <select className="bg-stone-50 border-none text-sm text-stone-700 font-medium px-4 py-2 rounded-full focus:ring-0 cursor-pointer outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-[400px] w-full">
          {loading || !data ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.volume_chart} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a8a29e", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a8a29e", fontSize: 12 }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", padding: "12px 20px" }}
                  itemStyle={{ fontSize: "14px", fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="total" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </div>
  );
}
