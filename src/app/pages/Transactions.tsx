import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';
import { TimelineView } from '../components/TimelineView';

type Txn = {
  id: string; time: string; merchant: string; customer: string; method: string;
  rail: string; sourceAmount: number; sourceCurrency: string;
  status: string; note: string;
  events: { time: string; label: string; detail: string }[];
};

type Enrichment = {
  title: string;
  diagnosis: string;
  historical: string;
  action: string;
  customerCopy: string;
};

const PAGE_SIZE = 10;

export function Transactions() {
  const { data, loading, error, refetch } = useAsync(() => configService.getTransactions(), []);
  const { data: failureCodes } = useAsync(() => configService.getFailureCodes(), []);
  const { data: searchCfg } = useAsync(() => configService.getTxnSearch(), []);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Txn | null>(null);
  const [page, setPage] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);

  if (error) return <ErrorState message={`Couldn't load transactions — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading ledger" />;

  const fxToInr = data.fxToInr as Record<string, number>;
  const toInr = (amount: number, cur: string) => amount * (fxToInr[cur] ?? 1);
  const formatInr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const formatSource = (amount: number, cur: string) => {
    const sym: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$' };
    return (sym[cur] || '') + amount.toLocaleString('en-IN');
  };

  // Parse the search query into structured filters. Returns:
  //   - chips: what Nexora understood (shown to user)
  //   - residual: words not matched to any rule (used as free-text fallback)
  //   - predicates: functions that each row must pass
  type ParsedQuery = { chips: { label: string; kind: string }[]; predicates: ((t: Txn, inr: number) => boolean)[]; residual: string };

  const parseQuery = (q: string): ParsedQuery => {
    const chips: { label: string; kind: string }[] = [];
    const predicates: ((t: Txn, inr: number) => boolean)[] = [];
    if (!q.trim() || !searchCfg) return { chips, predicates, residual: q.trim() };

    let remaining = ' ' + q.toLowerCase() + ' ';
    const strike = (pattern: string) => {
      const re = new RegExp(`\\b${pattern.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      remaining = remaining.replace(re, ' ');
    };

    // amount regex (e.g. "over 1000")
    for (const rule of searchCfg.amountRegex) {
      const re = new RegExp(rule.match, 'i');
      const m = remaining.match(re);
      if (m) {
        const num = parseInt(m[1].replace(/,/g, ''), 10);
        if (!isNaN(num)) {
          if (rule.op === '>') {
            predicates.push((_t, inr) => inr > num);
            chips.push({ label: `amount > ₹${num.toLocaleString('en-IN')}`, kind: 'amount' });
          } else {
            predicates.push((_t, inr) => inr < num);
            chips.push({ label: `amount < ₹${num.toLocaleString('en-IN')}`, kind: 'amount' });
          }
          strike(m[0]);
        }
      }
    }

    // parsers (merchant / status / method / cross-border)
    for (const parser of searchCfg.parsers) {
      for (const pattern of parser.patterns) {
        const re = new RegExp(`\\b${pattern.toLowerCase()}\\b`);
        if (re.test(remaining)) {
          if (parser.meta?.type === 'merchant') {
            const merchantToken = pattern;
            predicates.push(t => t.merchant.toLowerCase().includes(merchantToken));
            chips.push({ label: `merchant · ${pattern}`, kind: 'merchant' });
          } else if (parser.filter) {
            const f = parser.filter;
            if (f.status) {
              predicates.push(t => t.status === f.status);
            }
            if (f.methodSubstr) {
              const s = f.methodSubstr.toLowerCase();
              predicates.push(t => t.method.toLowerCase().includes(s));
            }
            if (f.crossBorder) {
              predicates.push(t => t.sourceCurrency !== 'INR');
            }
            chips.push({ label: parser.label || parser.id, kind: parser.id });
          }
          strike(pattern);
          break;
        }
      }
    }

    const residual = remaining.trim();
    return { chips, predicates, residual };
  };

  const parsed = parseQuery(search);

  const filtered = (data.transactions as Txn[]).filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    const inr = toInr(t.sourceAmount, t.sourceCurrency);
    for (const pred of parsed.predicates) {
      if (!pred(t, inr)) return false;
    }
    if (parsed.residual) {
      if (!(t.merchant + ' ' + t.customer + ' ' + t.id).toLowerCase().includes(parsed.residual)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const setFilterReset = (f: string) => { setFilter(f); setPage(0); };
  const setSearchReset = (v: string) => { setSearch(v); setPage(0); };

  const enrichEvent = (detail: string): Enrichment | null => {
    if (!failureCodes) return null;
    for (const key of Object.keys(failureCodes.codes)) {
      const entry = failureCodes.codes[key];
      for (const pattern of entry.match) {
        if (detail.toLowerCase().includes(pattern.toLowerCase())) return entry;
      }
    }
    return null;
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Ledger</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Transactions</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Every payment across all merchants. Unified in INR, source preserved.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconFilter size={14} />} onClick={() => toast.success('Filters', { description: 'Status · method · amount range · date · merchant' })}>Filters</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success(`Exporting ${filtered.length} transactions as CSV`)}>Export CSV</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {data.filters.map((f: string) => (
              <button key={f} onClick={() => setFilterReset(f)} style={{
                padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
                background: filter === f ? colors.card : 'transparent',
                color: filter === f ? colors.ink : colors.text2,
                border: filter === f ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: typography.family.sans,
              }}>{f}</button>
            ))}
          </div>
          <div style={{ position: 'relative', minWidth: '380px', flex: 1, maxWidth: '560px' }}>
            <Icons.IconSparkle size={14} color={colors.teal} style={{ position: 'absolute', left: '14px', top: '13px', zIndex: 1 }} />
            <input
              value={search}
              onChange={(e) => setSearchReset(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              placeholder={searchCfg?.placeholder || 'Search id, merchant, customer…'}
              style={{
                background: colors.bg, border: `0.5px solid ${parsed.chips.length > 0 ? colors.teal : colors.border}`, borderRadius: radius.pill,
                padding: '9px 14px 9px 36px', fontSize: '12px', width: '100%', outline: 'none',
                color: colors.ink, fontFamily: typography.family.sans,
                transition: 'border-color 0.15s',
              }}
            />

            {/* Suggestions dropdown */}
            {searchFocused && !search && searchCfg && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 20,
                background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md,
                boxShadow: colors.shadowMd, padding: '10px 12px',
              }}>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.IconSparkle size={10} color={colors.teal} />
                  Try asking in plain English
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                  {searchCfg.suggestions.map((s: any) => (
                    <button
                      key={s.query}
                      onMouseDown={(e) => { e.preventDefault(); setSearchReset(s.query); }}
                      style={{ padding: '4px 10px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '11px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}
                    >{s.label}</button>
                  ))}
                </div>
                <div style={{ fontSize: '10px', color: colors.text3, lineHeight: 1.5 }}>{searchCfg.hint}</div>
              </div>
            )}
          </div>
        </div>

        {/* Parsed filter chips */}
        {parsed.chips.length > 0 && (
          <div style={{ padding: '10px 24px', borderBottom: `0.5px solid ${colors.border}`, background: colors.tealTint, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icons.IconSparkle size={10} color={colors.teal} />
              Nexora understood
            </span>
            {parsed.chips.map((chip, i) => (
              <span key={i} style={{
                fontSize: '11px',
                padding: '3px 9px',
                background: colors.card,
                border: `0.5px solid ${colors.teal}`,
                borderRadius: radius.pill,
                color: colors.ink,
                fontFamily: chip.kind === 'amount' || chip.kind === 'merchant' ? typography.family.mono : typography.family.sans,
                fontWeight: 500,
              }}>{chip.label}</span>
            ))}
            {parsed.residual && (
              <span style={{ fontSize: '11px', color: colors.text2 }}>
                + free-text <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>"{parsed.residual}"</span>
              </span>
            )}
            <button onClick={() => setSearchReset('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '11px', color: colors.text2, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              Clear
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.4fr 1fr 1.1fr 0.9fr 0.3fr', gap: '16px', padding: '12px 24px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>ID</div><div>Time</div><div>Merchant · Customer</div><div>Method</div>
          <div style={{ textAlign: 'right' }}>Amount (INR / source)</div><div>Status</div><div></div>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>
            No transactions match these filters.
          </div>
        ) : (
          paged.map((t, i) => (
            <TxnRow key={t.id} txn={t} isLast={i === paged.length - 1} onClick={() => setSelected(t)}
              inr={toInr(t.sourceAmount, t.sourceCurrency)}
              formatInr={formatInr} formatSource={formatSource}
            />
          ))
        )}

        <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: colors.text2 }}>
            {filtered.length === 0 ? 'No results' : (
              <>Showing <span style={{ color: colors.ink, fontWeight: 500 }}>{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)}</span> of <span style={{ color: colors.ink, fontWeight: 500 }}>{filtered.length}</span>{filtered.length !== data.totalCount && ` (of ${data.totalCount.toLocaleString('en-IN')} total)`}</>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono, marginRight: '4px' }}>
              Page {currentPage + 1} of {totalPages}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
              ← Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>
              Next →
            </Button>
          </div>
        </div>
      </Card>

      {selected && (
        <TxnDetailDrawer
          txn={selected}
          onClose={() => setSelected(null)}
          fxRate={fxToInr[selected.sourceCurrency]}
          toInr={toInr}
          formatSource={formatSource}
          enrichEvent={enrichEvent}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  const positive = change.startsWith('+');
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: '11px', fontWeight: 500, color: positive ? colors.teal : colors.text2 }}>{change}</div>
      </div>
    </Card>
  );
}

function TxnRow({ txn, isLast, onClick, inr, formatInr, formatSource }: any) {
  const statusMap: Record<string, { color: string; label: string }> = {
    succeeded: { color: colors.ink, label: 'Succeeded' },
    routed: { color: colors.teal, label: 'Routed' },
    blocked: { color: colors.text2, label: 'Blocked' },
    refunded: { color: colors.text2, label: 'Refunded' },
  };
  const s = statusMap[txn.status];
  const isCrossBorder = txn.sourceCurrency !== 'INR';

  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.4fr 1fr 1.1fr 0.9fr 0.3fr', gap: '16px',
      padding: '16px 24px', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
      alignItems: 'center', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{txn.id}</div>
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{txn.time}</div>
      <div>
        <div style={{ color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{txn.merchant}</div>
        <div style={{ color: colors.text3, fontSize: '11px' }}>{txn.customer}</div>
      </div>
      <div style={{ fontSize: '12px', color: colors.text2 }}>{txn.method}</div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, color: txn.status === 'blocked' ? colors.text2 : colors.ink, textDecoration: txn.status === 'blocked' ? 'line-through' : 'none' }}>
          {formatInr(inr)}
        </div>
        {isCrossBorder && (
          <div style={{ fontSize: '11px', color: colors.text3, marginTop: '2px', fontFamily: typography.family.mono }}>
            {formatSource(txn.sourceAmount, txn.sourceCurrency)}
          </div>
        )}
      </div>
      <div>
        <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.08em', color: s.color, textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</span>
        {txn.note && <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{txn.note}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <Icons.IconArrowUpRight size={14} color={colors.text3} />
      </div>
    </div>
  );
}

function TxnDetailDrawer({ txn, onClose, fxRate, toInr, formatSource, enrichEvent }: any) {
  const [showTimeline, setShowTimeline] = useState(false);
  const inr = toInr(txn.sourceAmount, txn.sourceCurrency);
  const isCrossBorder = txn.sourceCurrency !== 'INR';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '560px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Transaction</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{txn.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', color: colors.text2, fontWeight: 400 }}>₹</span>
          <span style={{ fontSize: '48px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {Math.round(inr).toLocaleString('en-IN')}
          </span>
        </div>
        {isCrossBorder && (
          <div style={{ fontSize: '12px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '24px' }}>
            Source: {formatSource(txn.sourceAmount, txn.sourceCurrency)} · rate {fxRate.toFixed(2)} {txn.sourceCurrency}→INR
          </div>
        )}
        {!isCrossBorder && <div style={{ marginBottom: '24px' }} />}

        <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <DetailRow label="Merchant" value={txn.merchant} />
          <DetailRow label="Customer" value={txn.customer} />
          <DetailRow label="Method" value={txn.method} />
          <DetailRow label="Rail" value={txn.rail} mono />
          <DetailRow label="Time" value={txn.time} mono />
          <DetailRow label="Status" value={txn.status.toUpperCase()} isLast mono />
        </div>

        {txn.paCb && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Kicker>PA-CB compliance · cross-border</Kicker>
              <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', fontWeight: 600, padding: '2px 8px', background: 'rgba(28,111,107,0.08)', border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill }}>RBI PA-CB</span>
            </div>
            <div style={{ fontSize: '10px', color: colors.text3, marginBottom: '12px', lineHeight: 1.5 }}>
              Per RBI PA-CB Regulations (31 Oct 2024) · purpose-coded, separately-escrowed, and FEMA-reportable.
            </div>
            <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
              <div style={{ padding: '12px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, marginBottom: '14px' }}>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>FEMA purpose code</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{txn.paCb.purposeCode}</span>
                  <span style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{txn.paCb.purposeDescription}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <DetailRow label="Direction"      value={txn.paCb.direction} />
                <DetailRow label="AD Bank"        value={txn.paCb.adBank} />
                <DetailRow label="PA-CB escrow"   value={txn.paCb.escrowAccount} mono />
                <DetailRow label="INR equivalent" value={txn.paCb.inrEquivalent} mono />
                <DetailRow label="FX margin"      value={`${txn.paCb.fxMarginBps} bps`} mono />
                <DetailRow label="FEMA"           value={txn.paCb.fema.reportingStatus} />
                <DetailRow label="eBRC"           value={txn.paCb.fema.eBrcStatus} />
                <DetailRow label="Sanctions"      value={txn.paCb.sanctionsCleared ? '✓ cleared · OFAC/UN/MHA/PEP' : 'under review'} isLast />
              </div>
              <div style={{ padding: '10px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, marginTop: '12px', fontSize: '10px', color: colors.text2, lineHeight: 1.55 }}>
                <span style={{ color: colors.text3, fontWeight: 500, letterSpacing: '0.06em' }}>LRS · </span>
                {txn.paCb.lrsNote}
              </div>
            </div>
          </>
        )}

        <Kicker style={{ marginBottom: '14px' }}>Event timeline</Kicker>
        <div style={{ marginBottom: '24px' }}>
          {txn.events.map((e: any, i: number) => {
            const enrichment = enrichEvent(e.detail);
            const isLast = i === txn.events.length - 1;
            return (
              <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: !isLast ? '16px' : 0, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isLast ? colors.teal : colors.ink }} />
                  {!isLast && <div style={{ width: '1px', flex: 1, background: colors.border, marginTop: '4px' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{e.label}</div>
                    <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3 }}>{e.time}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5, fontFamily: typography.family.mono }}>{e.detail}</div>

                  {enrichment && (
                    <div style={{
                      marginTop: '10px', padding: '12px 14px',
                      background: colors.bg, border: `0.5px solid ${colors.border}`,
                      borderRadius: radius.md,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Icons.IconSparkle size={11} color={colors.teal} />
                        <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>What this means</div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginBottom: '6px', lineHeight: 1.5 }}>{enrichment.title}</div>
                      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '10px' }}>{enrichment.diagnosis}</div>

                      {enrichment.historical && (
                        <div style={{ fontSize: '11px', color: colors.text3, fontStyle: 'italic', lineHeight: 1.55, marginBottom: '10px' }}>
                          {enrichment.historical}
                        </div>
                      )}

                      <EnrichRow label="What to do" value={enrichment.action} />
                      {enrichment.customerCopy && <EnrichRow label="Customer copy" value={enrichment.customerCopy} isQuote />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {txn.status === 'succeeded' && <Button variant="secondary" size="sm" onClick={() => toast.success('Refund initiated')}>Refund</Button>}
          {txn.status === 'blocked' && <Button variant="secondary" size="sm" onClick={() => toast.success('Released to retry')}>Release</Button>}
          <Button variant="secondary" size="sm" icon={<Icons.IconClock size={12} />} onClick={() => setShowTimeline(true)}>View timeline</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Receipt PDF downloaded', { description: `${txn.id} · GSTR-1 ready · signed PDF` })}>Download receipt</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(txn.id); toast.success('ID copied'); }}>Copy id</Button>
        </div>
      </div>

      {showTimeline && <TimelineView txnId={txn.id} onClose={() => setShowTimeline(false)} />}
    </div>
  );
}

function EnrichRow({ label, value, isQuote }: { label: string; value: string; isQuote?: boolean }) {
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.5, fontStyle: isQuote ? 'italic' : 'normal' }}>{value}</div>
    </div>
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
