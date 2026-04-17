import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

export function Developer() {
  const [mode, setMode] = useState<'test' | 'live'>('test');
  const [copied, setCopied] = useState<string | null>(null);

  const keys = mode === 'test'
    ? [
        { name: 'Publishable key', value: 'pk_test_a1b2c3d4e5f6g7h8i9j0', env: 'Test' },
        { name: 'Secret key', value: 'sk_test_9x8y7z6w5v4u3t2s1r0q', env: 'Test' },
      ]
    : [
        { name: 'Publishable key', value: 'pk_live_••••••••••••••', env: 'Live' },
        { name: 'Secret key', value: 'sk_live_••••••••••••••', env: 'Live' },
      ];

  const copy = (v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(v);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Integrate</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Developer</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Keys, webhooks, and a code sample to get you live in minutes.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
          {['test', 'live'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m as any)}
              style={{
                padding: '6px 14px', borderRadius: radius.pill,
                fontSize: '12px', fontWeight: 500,
                background: mode === m ? colors.card : 'transparent',
                color: mode === m ? colors.ink : colors.text2,
                border: mode === m ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', textTransform: 'capitalize',
                fontFamily: typography.family.sans,
              }}
            >
              {m} mode
            </button>
          ))}
        </div>
      </div>

      <Card padded style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Kicker>API keys</Kicker>
          <div style={{ fontSize: '11px', color: colors.text3 }}>Rotate with caution. Last rotated 18 days ago.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {keys.map((k) => (
            <div key={k.name} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '14px', background: colors.bg, borderRadius: radius.md,
              border: `0.5px solid ${colors.border}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{k.name}</span>
                  <Pill tone={mode === 'live' ? 'ink' : 'outline'}>{k.env}</Pill>
                </div>
                <div style={{ fontFamily: typography.family.mono, fontSize: '12px', color: colors.text2 }}>{k.value}</div>
              </div>
              <Button variant="secondary" size="sm" icon={copied === k.value ? <Icons.IconCheck size={12} /> : <Icons.IconCopy size={12} />} onClick={() => copy(k.value)}>
                {copied === k.value ? 'Copied' : 'Copy'}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        <Card padded={false} style={{ background: '#1A1A1A', color: '#F6F6F2', border: `0.5px solid rgba(255,255,255,0.08)` }}>
          <div style={{ padding: '16px 20px', borderBottom: `0.5px solid rgba(255,255,255,0.08)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: '#B4B4B0', letterSpacing: '0.08em' }}>sample.js</div>
            <Button variant="ghost" size="sm" style={{ color: '#F6F6F2', borderColor: 'rgba(255,255,255,0.15)' }} icon={<Icons.IconCopy size={11} />}>Copy</Button>
          </div>
          <pre style={{
            margin: 0, padding: '20px',
            fontFamily: typography.family.mono, fontSize: '12px',
            color: '#E8E4D9', lineHeight: 1.65,
            overflow: 'auto',
          }}>{`import Payze from '@payze/node';

const payze = new Payze(process.env.PAYZE_SECRET);

const payment = await payze.payments.create({
  amount: 1200,
  currency: 'inr',
  method: 'upi',
  customer: 'cus_a9f3e2',
  metadata: {
    invoice: 'INV-0228'
  }
});

console.log(payment.id);
// payze_pmt_9f3e2a1b8d`}</pre>
        </Card>

        <Card padded>
          <Kicker style={{ marginBottom: '16px' }}>Webhooks</Kicker>
          {[
            { url: 'https://acme.com/api/payze/webhook', events: '142 events · last success 2m ago', status: 'Healthy' },
            { url: 'https://staging.acme.com/payze', events: '12 events · last failure 1d ago', status: 'Degraded' },
          ].map((w, i) => (
            <div key={i} style={{
              padding: '14px 0',
              borderBottom: i === 0 ? `0.5px solid ${colors.border}` : 'none',
            }}>
              <div style={{ fontFamily: typography.family.mono, fontSize: '12px', color: colors.ink, marginBottom: '4px' }}>{w.url}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: colors.text3 }}>{w.events}</div>
                <Pill tone={w.status === 'Healthy' ? 'teal' : 'outline'}>{w.status}</Pill>
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" icon={<Icons.IconPlus size={12} />} style={{ marginTop: '12px', width: '100%' }}>Add endpoint</Button>
        </Card>
      </div>
    </div>
  );
}
