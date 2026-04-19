import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';

export function CheckoutStudio() {
  const { data, loading, error, refetch } = useAsync(() => configService.getCheckoutStudio(), []);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load studio — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading Checkout Studio" />;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => (
          <Card key={s.label} padded style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Customization */}
      <Card padded style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '28px' }}>
          <div>
            <Kicker style={{ marginBottom: '10px' }}>{data.customization.kicker}</Kicker>
            <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px' }}>{data.customization.summary}</div>

            {/* Brand preview tile */}
            <div style={{ padding: '16px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md }}>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Brand preset</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: radius.md, background: data.customization.brandPreset.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{data.customization.brandPreset.logoText.charAt(0)}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{data.customization.brandPreset.logoText}</div>
                  <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{data.customization.brandPreset.brandColor.toLowerCase()}</div>
                </div>
              </div>
              <button style={{ width: '100%', padding: '10px', background: data.customization.brandPreset.brandColor, border: 'none', color: '#fff', borderRadius: data.customization.brandPreset.buttonStyle === 'pill' ? radius.pill : radius.md, fontSize: '11px', fontWeight: 600, fontFamily: 'inherit' }}>Pay ₹{'{{amount}}'}</button>
              <div style={{ fontSize: '9px', color: colors.text3, marginTop: '8px', fontFamily: typography.family.mono }}>font: {data.customization.brandPreset.fontStack}</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
              <Kicker style={{ margin: 0 }}>Checkout settings</Kicker>
              <Button variant="ghost" size="sm" onClick={() => toast.success('Changes saved · propagating to all checkouts in 60s')}>Save changes</Button>
            </div>
            <div style={{ background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md }}>
              {data.customization.customization.map((c: any, i: number) => (
                <div key={c.key} style={{ padding: '12px 14px', borderBottom: i < data.customization.customization.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '14px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: colors.ink, fontWeight: 500 }}>{c.label}</div>
                      <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{c.hint}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.ink, fontFamily: typography.family.mono, padding: '6px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, wordBreak: 'break-all' }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* A/B tests */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
          <Kicker>A/B tests · running</Kicker>
          <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('New test wizard opened')}>New test</Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.abTests.map((t: any) => <ABTestCard key={t.id} test={t} onClick={() => setSelectedTest(t)} />)}
        </div>
      </div>

      {/* Retired tests */}
      <Card padded>
        <Kicker style={{ marginBottom: '12px' }}>Retired tests · shipped winners</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.9fr', gap: '14px', padding: '8px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Test</div><div>Winner</div><div style={{ textAlign: 'right' }}>Lift</div><div style={{ textAlign: 'right' }}>Shipped</div>
        </div>
        {data.retiredTests.map((r: any, i: number) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.8fr 0.9fr', gap: '14px', padding: '10px 0', borderBottom: i < data.retiredTests.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.ink }}>{r.name}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{r.winner}</div>
            <div style={{ textAlign: 'right', color: colors.teal, fontFamily: typography.family.mono, fontWeight: 600 }}>{r.lift}</div>
            <div style={{ textAlign: 'right', color: colors.text3, fontSize: '11px' }}>{r.endedAt}</div>
          </div>
        ))}
      </Card>

      {selectedTest && <ABTestDrawer test={selectedTest} onClose={() => setSelectedTest(null)} />}
    </div>
  );
}

function ABTestCard({ test, onClick }: any) {
  const statusMap: Record<string, { color: string; bg: string; label: string }> = {
    significant_winner: { color: colors.teal, bg: 'rgba(28,111,107,0.08)', label: 'Significant · winner picked' },
    gathering:          { color: AMBER,       bg: 'rgba(180,140,60,0.08)', label: 'Gathering · 82% confidence' },
  };
  const s = statusMap[test.status] || statusMap.gathering;
  return (
    <Card padded onClick={onClick} style={{ padding: '20px 22px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.005em' }}>{test.name}</span>
            <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: s.bg, color: s.color, border: `0.5px solid ${s.color}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{s.label}</span>
          </div>
          <div style={{ fontSize: '11px', color: colors.text3 }}>{test.goal} · started {test.startedAt}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: colors.teal, fontFamily: typography.family.mono, letterSpacing: '-0.02em' }}>{test.lift}</div>
          <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{test.confidence}% CI</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {test.variants.map((v: any) => (
          <div key={v.id} style={{ padding: '12px 14px', background: v.isWinner ? 'rgba(28,111,107,0.06)' : colors.bg, border: `0.5px solid ${v.isWinner ? 'rgba(28,111,107,0.3)' : colors.border}`, borderRadius: radius.md }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', padding: '2px 7px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{v.id}</span>
              {v.isControl && <span style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Control</span>}
              {v.isWinner && <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>✓ Winner</span>}
            </div>
            <div style={{ fontSize: '11px', color: colors.ink, marginBottom: '8px', lineHeight: 1.4 }}>{v.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{v.rate}%</div>
                <div style={{ fontSize: '9px', color: colors.text3, fontFamily: typography.family.mono }}>{v.conversions.toLocaleString('en-IN')} / {v.visitors.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ fontSize: '9px', color: colors.text3, fontFamily: typography.family.mono }}>{v.traffic}% traffic</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ABTestDrawer({ test, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '560px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>A/B test</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink }}>{test.name}</div>
            <div style={{ fontSize: '11px', color: colors.text2, marginTop: '2px' }}>{test.goal}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 18px', background: colors.bg, borderRadius: radius.md, marginBottom: '18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Lift</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.teal, fontFamily: typography.family.mono }}>{test.lift}</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Confidence</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{test.confidence}%</div>
          </div>
          <div>
            <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Sample</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: test.sampleSizeReached ? colors.teal : AMBER }}>{test.sampleSizeReached ? 'Reached' : 'Gathering'}</div>
          </div>
        </div>

        <div style={{ padding: '12px 14px', background: test.status === 'significant_winner' ? 'rgba(28,111,107,0.06)' : 'rgba(180,140,60,0.06)', border: `0.5px solid ${test.status === 'significant_winner' ? 'rgba(28,111,107,0.25)' : 'rgba(180,140,60,0.25)'}`, borderRadius: radius.md, marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: test.status === 'significant_winner' ? colors.teal : AMBER, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Recommendation</div>
          <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.55 }}>{test.recommendation}</div>
        </div>

        <Kicker style={{ marginBottom: '10px' }}>Variants</Kicker>
        {test.variants.map((v: any) => (
          <div key={v.id} style={{ padding: '14px 16px', marginBottom: '8px', background: v.isWinner ? 'rgba(28,111,107,0.06)' : colors.bg, border: `0.5px solid ${v.isWinner ? 'rgba(28,111,107,0.25)' : colors.border}`, borderRadius: radius.md }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', padding: '2px 8px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>Variant {v.id}</span>
              {v.isControl && <Pill tone="outline">Control</Pill>}
              {v.isWinner && <Pill tone="teal">Winner</Pill>}
            </div>
            <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '10px' }}>{v.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '11px' }}>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Conversion</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{v.rate}%</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Visitors</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{v.visitors.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Converted</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{v.conversions.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          {test.status === 'significant_winner' && <Button variant="primary" size="sm" onClick={() => toast.success('Winner shipped · test archived')}>Ship winner</Button>}
          <Button variant="secondary" size="sm" onClick={() => toast.success('Test paused · holding both variants')}>Pause</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Test ended · no winner selected')}>End test</Button>
        </div>
      </div>
    </div>
  );
}
