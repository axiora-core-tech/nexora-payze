import React, { useState, useEffect, useRef } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

type ReconMessage = { role: 'user'; text: string } | { role: 'copilot'; text: string; thinking?: boolean };

export function Settlements() {
  const { data, loading, error, refetch } = useAsync(() => configService.getSettlements(), []);
  const [status, setStatus] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selected, setSelected] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load settlements — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading settlements" />;

  const { header, stats, statusFilters, dateRanges, batches } = data;

  const filtered = batches.filter((b: any) => {
    if (status !== 'all' && b.status.toLowerCase() !== status) return false;
    if (merchantFilter !== 'all' && b.merchant !== merchantFilter) return false;
    return true;
  });

  const merchants = Array.from(new Set(batches.map((b: any) => b.merchant))) as string[];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconSettings size={14} />} onClick={() => toast.success('Payout config opened')}>Payout config</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success(`Exporting ${filtered.length} batches as CSV`)}>Export CSV</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {statusFilters.map((s: string) => (
              <button key={s} onClick={() => setStatus(s)} style={{
                padding: '6px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
                background: status === s ? colors.card : 'transparent',
                color: status === s ? colors.ink : colors.text2,
                border: status === s ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: typography.family.sans,
              }}>{s}</button>
            ))}
          </div>
          <select value={merchantFilter} onChange={e => setMerchantFilter(e.target.value)} style={selectStyle}>
            <option value="all">All merchants</option>
            {merchants.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
            {dateRanges.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: colors.text2 }}>{filtered.length} of {batches.length}</div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 1fr 0.7fr 1fr 0.9fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Batch</div><div>Merchant · Count</div><div style={{ textAlign: 'right' }}>Amount</div>
          <div>Rail</div><div>Arrives</div><div>Status</div><div></div>
        </div>

        {filtered.map((b: any, i: number) => {
          const statusTone = b.status === 'Settled' ? 'teal' : b.status === 'Settling' ? 'outline' : b.status === 'Failed' ? 'outline' : 'neutral';
          return (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 1fr 0.7fr 1fr 0.9fr 0.4fr', gap: '16px',
              padding: '16px 24px',
              borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
              alignItems: 'center', fontSize: '13px', cursor: 'pointer',
            }}
              onClick={() => setSelected(b)}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{b.id}</div>
              <div>
                <div style={{ color: colors.ink, fontWeight: 500 }}>{b.merchant}</div>
                <div style={{ color: colors.text3, fontSize: '11px' }}>{b.count.toLocaleString('en-IN')} transactions</div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 600, color: colors.ink }}>{b.amount}</div>
              <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{b.method}</div>
              <div style={{ color: colors.text2, fontSize: '12px' }}>{b.arrived}</div>
              <div><Pill tone={statusTone as any}>{b.status}</Pill></div>
              <div style={{ textAlign: 'right' }}><Icons.IconArrowUpRight size={14} color={colors.text3} /></div>
            </div>
          );
        })}
      </Card>

      {selected && <ReconciliationDrawer batch={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ReconciliationDrawer({ batch, onClose }: { batch: any; onClose: () => void }) {
  const [tab, setTab] = useState<'breakdown' | 'copilot'>('breakdown');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '600px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 0 28px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Reconciliation report</Kicker>
              <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{batch.id}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
              <Icons.IconX size={18} />
            </button>
          </div>

          <div style={{ fontSize: '44px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px' }}>{batch.amount}</div>
          <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '20px' }}>
            Net of {batch.count.toLocaleString('en-IN')} transactions · to {batch.merchant}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content', marginBottom: '0' }}>
            <button onClick={() => setTab('breakdown')} style={tabBtnStyle(tab === 'breakdown')}>
              Breakdown
            </button>
            <button onClick={() => setTab('copilot')} style={tabBtnStyle(tab === 'copilot')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Icons.IconSparkle size={11} color={tab === 'copilot' ? colors.teal : colors.text2} />
                Ask Copilot
              </span>
            </button>
          </div>
        </div>

        {tab === 'breakdown' ? (
          <BreakdownTab batch={batch} />
        ) : (
          <CopilotTab batch={batch} />
        )}
      </div>
    </div>
  );
}

function BreakdownTab({ batch }: { batch: any }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px 28px' }}>
      <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
        <DetailRow label="Status" value={batch.status} />
        <DetailRow label="Rail" value={batch.method} mono />
        <DetailRow label="Account" value={batch.account} mono />
        <DetailRow label="UTR" value={batch.utr} mono />
        <DetailRow label="Arrived" value={batch.arrived} />
        <DetailRow label="Processing fee" value={batch.fee} />
        <DetailRow label="GST" value={batch.tax} isLast />
      </div>

      <Kicker style={{ marginBottom: '14px' }}>Reconciliation breakdown</Kicker>
      <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '24px', fontSize: '12px', fontFamily: typography.family.mono }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ color: colors.text2 }}>Gross volume</span>
          <span style={{ color: colors.ink }}>{batch.amount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: colors.text2 }}>Refunds</span><span style={{ color: colors.text2 }}>− ₹0</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: colors.text2 }}>Chargebacks</span><span style={{ color: colors.text2 }}>− ₹0</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: colors.text2 }}>Processing fees</span><span style={{ color: colors.text2 }}>− {batch.fee}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: `0.5px solid ${colors.border}`, marginTop: '4px', paddingTop: '10px' }}><span style={{ color: colors.text2 }}>GST @ 18%</span><span style={{ color: colors.text2 }}>− {batch.tax}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0 0', borderTop: `0.5px solid ${colors.ink}`, marginTop: '4px' }}>
          <span style={{ color: colors.ink, fontWeight: 600 }}>Net settled</span>
          <span style={{ color: colors.ink, fontWeight: 600 }}>{batch.amount}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button variant="primary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('CSV downloaded')}>Download CSV</Button>
        <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('PDF downloaded')}>Download PDF</Button>
        <Button variant="ghost" icon={<Icons.IconMail size={14} />} onClick={() => toast.success('Report emailed')}>Email</Button>
      </div>
    </div>
  );
}

function CopilotTab({ batch }: { batch: any }) {
  const { data: recon } = useAsync(() => configService.getReconciliation(), []);
  const [messages, setMessages] = useState<ReconMessage[]>([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const batchScenarios = recon?.batches?.[batch.id];
  const greeting = batchScenarios?.summary ?? `I've already cross-checked ${batch.id} against the bank statement and ledger. Ask me anything.`;
  const quickPrompts = recon?.quickPrompts ?? [];

  const findAnswer = (query: string): string => {
    if (!batchScenarios) {
      return recon?.fallback?.message ?? "I don't have a scripted answer for that batch.";
    }
    const q = query.toLowerCase();
    for (const s of batchScenarios.scenarios) {
      for (const t of s.triggers) {
        if (q.includes(t.toLowerCase())) return s.answer;
      }
    }
    return (recon?.fallback?.message ?? "I don't have a scripted answer for that.") + ' ' + (recon?.fallback?.suggestion ?? '');
  };

  const submit = async (q: string) => {
    if (!q.trim() || submitting) return;
    setMessages(m => [...m, { role: 'user', text: q }, { role: 'copilot', text: '', thinking: true }]);
    setInput('');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    const answer = findAnswer(q);
    setMessages(m => {
      const next = m.slice(0, -1);
      next.push({ role: 'copilot', text: answer });
      return next;
    });
    setSubmitting(false);
  };

  return (
    <>
      {/* Greeting + quick prompts (sticky at top of chat area) */}
      <div style={{ padding: '16px 28px', borderTop: `0.5px solid ${colors.border}`, borderBottom: messages.length === 0 ? 'none' : `0.5px solid ${colors.border}`, background: colors.bg, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: messages.length === 0 ? '14px' : 0 }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.IconSparkle size={11} color={colors.teal} />
          </div>
          <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.55, flex: 1 }}>{greeting}</div>
        </div>

        {messages.length === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '34px' }}>
            {quickPrompts.map((p: string, i: number) => (
              <button key={i} onClick={() => submit(p)} style={{
                padding: '5px 10px', background: colors.card,
                border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
                fontSize: '11px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.teal; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}
              >{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'copilot' && (
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '10px', marginTop: '2px' }}>
                <Icons.IconSparkle size={11} color={colors.teal} />
              </div>
            )}
            {m.role === 'user' ? (
              <div style={{ background: colors.ink, color: '#fff', padding: '10px 14px', borderRadius: '16px 16px 4px 16px', maxWidth: '82%', fontSize: '13px', lineHeight: 1.5 }}>
                {m.text}
              </div>
            ) : m.thinking ? (
              <div style={{ padding: '10px 14px', background: colors.bg, borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: colors.text2, display: 'inline-flex', gap: '4px' }}>
                <ThinkingDot delay={0} /><ThinkingDot delay={0.2} /><ThinkingDot delay={0.4} />
              </div>
            ) : (
              <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: '16px 16px 16px 4px', maxWidth: '82%', fontSize: '13px', color: colors.ink, lineHeight: 1.6 }}>
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div style={{ padding: '14px 28px', borderTop: `0.5px solid ${colors.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input); } }}
            placeholder={`Ask about ${batch.id}…`}
            rows={1}
            disabled={submitting}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: '13px',
              background: 'transparent', color: colors.ink, fontFamily: 'inherit',
              resize: 'none', padding: '6px 0', minHeight: '22px', maxHeight: '80px', lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || submitting}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: input.trim() && !submitting ? colors.ink : colors.borderHover,
              color: '#fff', border: 'none', cursor: input.trim() && !submitting ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            aria-label="Send"
          >
            <Icons.IconArrowRight size={12} color="#fff" />
          </button>
        </div>
      </div>
    </>
  );
}

function ThinkingDot({ delay }: { delay: number }) {
  return <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: colors.text2, animation: `payze-pulse-dot 1.4s ease-in-out ${delay}s infinite` }} />;
}

function StatCard({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

function DetailRow({ label, value, isLast, mono }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '10px', fontWeight: 500 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
  fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
};

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
    background: active ? colors.card : 'transparent',
    color: active ? colors.ink : colors.text2,
    border: active ? `0.5px solid ${colors.border}` : 'none',
    cursor: 'pointer', fontFamily: typography.family.sans,
  };
}
