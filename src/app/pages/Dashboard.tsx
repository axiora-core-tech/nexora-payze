import React from 'react';
import { useParams } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker } from '../../design/primitives';
import * as Icons from '../../design/icons';

const mockActivity = [
  { time: '14:47', sec: ':12', merchant: 'Acme Corporation', desc: 'payment via UPI after card retry', sub: 'Customer: Priya Venkataraman · Succeeded in 3.8s', amount: '+ ₹7,800', tone: 'teal' as const, tag: 'routed' },
  { time: '14:45', sec: ':33', merchant: 'Meridian Travel', desc: 'invoice paid', sub: 'INV-0228 · Visa · HDFC · Auth in 1.2s', amount: '+ ₹18,200', tone: 'neutral' as const, tag: null },
  { time: '14:42', sec: ':07', merchant: 'Nova Fintech', desc: 'declined at bank', sub: 'First-time buyer · velocity flag · will not retry', amount: '₹42,500', tone: 'blocked' as const, tag: 'blocked' },
  { time: '14:41', sec: ':19', merchant: 'Luminary Studio', desc: 'SEPA routed after ACH timeout', sub: 'International customer · Lumière Paris · 6.1s', amount: '+ €1,890', tone: 'teal' as const, tag: 'routed' },
  { time: '14:38', sec: ':56', merchant: 'Acme Corporation', desc: 'quarterly mandate collected', sub: 'UPI Autopay · Rohan Shankar · renewal cycle', amount: '+ ₹4,500', tone: 'neutral' as const, tag: null },
];

const mockAcceptance = [
  { name: 'UPI', rate: 97.1 },
  { name: 'Cards — Visa/Mastercard', rate: 91.3 },
  { name: 'NetBanking', rate: 88.7 },
  { name: 'Wallets', rate: 94.5 },
  { name: 'International — SEPA/ACH', rate: 82.4 },
];

const mockTopMerchants = [
  { initial: 'A', name: 'Acme', gmv: '₹12.4L', change: '+8.4%', up: true, path: 'M 0 20 L 15 18 L 30 15 L 45 16 L 60 10 L 75 8 L 90 4 L 100 3' },
  { initial: 'N', name: 'Nova', gmv: '₹9.8L', change: '+4.1%', up: true, path: 'M 0 15 L 15 12 L 30 18 L 45 14 L 60 8 L 75 12 L 90 6 L 100 5' },
  { initial: 'M', name: 'Meridian', gmv: '₹6.2L', change: '−1.8%', up: false, path: 'M 0 10 L 15 14 L 30 11 L 45 17 L 60 14 L 75 19 L 90 15 L 100 18' },
  { initial: 'L', name: 'Luminary', gmv: '₹4.1L', change: '+12.3%', up: true, path: 'M 0 18 L 15 16 L 30 14 L 45 12 L 60 10 L 75 9 L 90 8 L 100 7' },
  { initial: 'H', name: 'Horizon', gmv: '₹3.7L', change: '+0.4%', up: false, path: 'M 0 12 L 15 13 L 30 10 L 45 11 L 60 9 L 75 11 L 90 8 L 100 10' },
];

export function Dashboard() {
  const params = useParams<{ slug?: string }>();
  const basePath = params.slug ? `/t/${params.slug}` : '/app';

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Overview</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Today</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
          Thursday, 17 April · 14:47 IST
        </div>
      </div>

      <Card padded style={{ padding: '32px', marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '16px' }}>Available platform balance</Kicker>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '32px', color: colors.text2, fontWeight: 400 }}>₹</span>
          <span style={{ ...typography.heroNum, color: colors.ink }}>
            8,42,16,<span style={{ color: colors.teal }}>950</span>
          </span>
        </div>

        <div style={{
          display: 'flex', gap: '28px',
          paddingTop: '18px', borderTop: `0.5px solid ${colors.border}`,
          flexWrap: 'wrap',
        }}>
          <StatCell label="Settling today" value="₹64,80,200" />
          <Divider />
          <StatCell label="In transit" value="₹18,42,100" />
          <Divider />
          <StatCell label="Active merchants" value="47" extra={<span style={{ color: colors.teal, fontWeight: 500, fontSize: '12px' }}>+3 this week</span>} />
          <Divider />
          <StatCell label="Today vs yesterday" value={<>↗ +3.2% <span style={{ color: colors.text2, fontSize: '12px', fontWeight: 400 }}>(₹26.4L)</span></>} />
        </div>

        <div style={{
          marginTop: '24px', paddingTop: '20px',
          borderTop: `0.5px solid ${colors.border}`,
          display: 'flex', gap: '16px', alignItems: 'center',
        }}>
          <Kicker style={{ fontSize: '10px' }}>Balance, last 14 days</Kicker>
          <div style={{ flex: 1, display: 'flex', gap: '3px', alignItems: 'flex-end', height: '32px' }}>
            {[42, 55, 48, 65, 52, 70, 58, 78, 65, 82, 88, 75, 92, 100].map((h, i) => (
              <div key={i} style={{
                flex: 1, borderRadius: '1.5px', height: `${h}%`,
                background: i === 12 ? 'rgba(28,111,107,0.5)' : i === 13 ? colors.teal : 'rgba(26,26,26,0.12)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.teal }}>+18.4%</span>
            <span style={{ fontSize: '11px', color: colors.text3 }}>2w</span>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded={false}>
          <div style={{ padding: '20px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', background: colors.teal,
                boxShadow: `0 0 0 3px ${colors.tealTintStrong}`,
                animation: 'payze-pulse-dot 2s ease-in-out infinite',
              }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Live activity</div>
              <div style={{ fontSize: '12px', color: colors.text2 }}>across all merchants</div>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2 }}>last 12 minutes</div>
          </div>
          <div style={{ padding: '4px 24px' }}>
            {mockActivity.map((t, i) => (
              <ActivityRow key={i} {...t} isLast={i === mockActivity.length - 1} />
            ))}
          </div>
          <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, textAlign: 'center' }}>
            <a href={`${basePath}/transactions`} style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              See the full ledger <Icons.IconArrowUpRight size={12} />
            </a>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card padded>
            <Kicker style={{ marginBottom: '14px' }}>Acceptance by method</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockAcceptance.map((m) => (
                <AcceptanceBar key={m.name} name={m.name} rate={m.rate} />
              ))}
            </div>
          </Card>

          <Card padded>
            <Kicker style={{ marginBottom: '12px' }}>Routing, last 24 hours</Kicker>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: colors.text2 }}>₹</span>
              <span style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>3,48,200</span>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>
              <span style={{ color: colors.ink, fontWeight: 600 }}>142 payments</span> routed via fallback · median resolution <span style={{ color: colors.ink, fontWeight: 600 }}>4.2s</span>
            </div>
          </Card>
        </div>
      </div>

      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
          <div>
            <Kicker style={{ marginBottom: '4px' }}>Top merchants · today</Kicker>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>By volume, live</div>
          </div>
          <a href={`${basePath}/tenants`} style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>All 47 merchants →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {mockTopMerchants.map((m, i) => (
            <MerchantTile key={i} {...m} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCell({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: colors.text3, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{label}</div>
      <div style={{ color: colors.ink, fontSize: '15px', fontWeight: 600 }}>
        {value} {extra}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: '0.5px', background: colors.border }} />;
}

function ActivityRow({ time, sec, merchant, desc, sub, amount, tone, tag, isLast }: any) {
  const bar = tone === 'teal' ? colors.tealTintStrong : tone === 'blocked' ? 'rgba(26,26,26,0.25)' : 'rgba(26,26,26,0.1)';
  const amountColor = tone === 'teal' ? colors.teal : tone === 'blocked' ? colors.text2 : colors.ink;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 0',
      borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '46px' }}>
        <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2, fontWeight: 500 }}>{time}</div>
        <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>{sec}</div>
      </div>
      <div style={{ width: '4px', height: '40px', background: bar, borderRadius: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: colors.ink, marginBottom: '2px' }}>
          <span style={{ fontWeight: 600 }}>{merchant}</span>{' '}
          <span style={{ color: colors.text2 }}>· {desc}</span>
          {tag === 'blocked' && (
            <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.08em', color: colors.text2, textTransform: 'uppercase', marginLeft: '6px', textDecoration: 'underline' }}>
              BLOCKED
            </span>
          )}
        </div>
        <div style={{ fontSize: '11px', color: colors.text3 }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: amountColor, textDecoration: tone === 'blocked' ? 'line-through' : 'none' }}>{amount}</div>
        <div style={{ fontSize: '10px', color: tone === 'teal' ? colors.teal : colors.text3, marginTop: '2px', fontFamily: tone === 'teal' ? typography.family.mono : undefined, letterSpacing: tone === 'teal' ? '0.08em' : 'normal', textTransform: tone === 'teal' ? 'uppercase' : 'none' }}>
          {tone === 'teal' ? 'ROUTED' : tone === 'blocked' ? 'flagged · risk' : 'succeeded'}
        </div>
      </div>
    </div>
  );
}

function AcceptanceBar({ name, rate }: { name: string; rate: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
        <span style={{ color: colors.ink, fontWeight: 500 }}>{name}</span>
        <span style={{ color: colors.ink, fontWeight: 600 }}>{rate}%</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: colors.ink, borderRadius: '2px' }} />
      </div>
    </div>
  );
}

function MerchantTile({ initial, name, gmv, change, up, path }: any) {
  return (
    <div style={{ padding: '14px', background: colors.bg, borderRadius: radius.md }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
          {initial}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{name}</div>
      </div>
      <svg viewBox="0 0 100 28" style={{ width: '100%', height: '28px' }} preserveAspectRatio="none">
        <path d={path} fill="none" stroke={up ? colors.teal : colors.text2} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{gmv}</div>
        <div style={{ fontSize: '10px', color: up ? colors.teal : colors.text2, fontWeight: 500 }}>{change}</div>
      </div>
    </div>
  );
}
