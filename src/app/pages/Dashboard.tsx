import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, Send, Link as LinkIcon, Download, Zap, ArrowRight } from "lucide-react";
import { Link, useParams } from "react-router";
import { dashboardService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { CardSkeleton, RowSkeleton, Skeleton, ErrorState } from "../components/Loaders";

export function Dashboard() {
  const { data, loading, error, refetch } = useAsync(() => dashboardService.getOverview(), []);
  const params = useParams<{ slug?: string }>();
  const basePath = params.slug ? `/t/${params.slug}` : '/app';

  if (error) return <ErrorState message="Couldn't load dashboard" onRetry={refetch} />;

  const balance = data?.balance;
  const transactions = data?.recent_transactions ?? [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 mt-8 relative">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/40 to-indigo-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply" />
      <div className="absolute top-[30%] right-[-15%] w-[400px] h-[400px] bg-gradient-to-br from-cyan-100/40 to-teal-100/40 rounded-full blur-[80px] -z-10 mix-blend-multiply" />

      {/* Header & Balance Block */}
      <section className="flex flex-col md:flex-row items-end justify-between gap-8 pt-8">
        <div className="flex-1">
          <h2 className="text-stone-500 font-medium tracking-wide text-sm uppercase mb-2">Total Available Balance</h2>
          {loading || !balance ? (
            <div className="space-y-4">
              <Skeleton className="w-[400px] h-20" />
              <Skeleton className="w-[300px] h-4" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl md:text-8xl font-light tracking-tighter text-stone-900">
                  ${Math.floor(balance.total).toLocaleString()}.
                </span>
                <span className="text-3xl md:text-5xl font-light text-stone-400">
                  {(balance.total % 1).toFixed(2).slice(2)}
                </span>
              </div>
              <p className="text-stone-500 mt-4 text-sm md:text-base max-w-sm leading-relaxed">
                {balance.greeting}. You received {balance.pending_transactions} new payments since your last visit.
              </p>
            </>
          )}
        </div>

        {/* Action Pills */}
        <div className="flex gap-4">
          <Link to={`${basePath}/pay`} className="group flex items-center gap-3 px-6 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Send size={16} />
            </div>
            <span className="font-medium pr-2">Send Money</span>
          </Link>
          <Link to={`${basePath}/invoice`} className="group flex items-center justify-center w-16 h-16 rounded-full bg-white text-stone-800 border border-stone-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
            <Download size={20} />
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-white to-stone-50 p-8 rounded-[40px] border border-stone-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-200/50 transition-colors" />
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
            <LinkIcon size={24} />
          </div>
          <h3 className="text-xl font-medium text-stone-800 mb-2">Generate Payment Link</h3>
          <p className="text-stone-500 text-sm mb-6 max-w-[80%] leading-relaxed">Share a frictionless checkout experience with anyone, anywhere.</p>
          <Link to={`${basePath}/payment-links`} className="flex items-center gap-2 text-stone-800 font-medium text-sm group/btn w-fit">
            Create link <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-white to-stone-50 p-8 rounded-[40px] border border-stone-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-200/50 transition-colors" />
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-medium text-stone-800 mb-2">Instant UPI Setup</h3>
          <p className="text-stone-500 text-sm mb-6 max-w-[80%] leading-relaxed">Connect your VPA and start accepting instant mobile payments.</p>
          <Link to={`${basePath}/onboarding`} className="flex items-center gap-2 text-stone-800 font-medium text-sm group/btn w-fit">
            Configure <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Transaction History */}
      <section className="pb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-light text-stone-800">Recent Movements</h3>
          <Link to={`${basePath}/analytics`} className="text-stone-400 hover:text-stone-800 transition-colors text-sm font-medium">See All</Link>
        </div>
        <div className="space-y-4">
          {loading ? (
            <>
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </>
          ) : (
            transactions.map((tx: any) => {
              const isCredit = tx.direction === "credit";
              const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
              const amountStr = `${isCredit ? "+" : ""}$${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              return (
                <motion.div
                  key={tx.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-md rounded-[28px] border border-stone-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-full ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} flex items-center justify-center`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-stone-800 font-medium text-lg">{tx.name}</h4>
                      <p className="text-stone-400 text-sm">{tx.date}</p>
                    </div>
                  </div>
                  <div className={`text-xl font-medium tracking-tight ${isCredit ? 'text-stone-800' : 'text-stone-500'}`}>
                    {amountStr}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
