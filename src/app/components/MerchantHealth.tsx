import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

type MerchantHealthRecord = {
  slug: string; name: string; score: number;
  trend: string; trendDelta: string; trendWindow: string;
  summary: string;
  strengths: string[]; concerns: string[]; observations: string[];
};

/** Panel version — full section with all merchants and a drilldown */
export function MerchantHealthPanel() {
  const { data } = useAsync(() => configService.getHealth(), []);
  const [selected, setSelected] = useState<string | null>(null);

  if (!data) return null;

  const merchants: MerchantHealthRecord[] = data.merchants;
  const selectedRecord = merchants.find(m => m.slug === selected) || merchants[0];

  const bandFor = (score: number) => {
    const legend: any = data.legend;
    if (score >= legend.thriving.min) return legend.thriving;
    if (score >= legend.steady.min) return legend.steady;
    if (score >= legend.attention.min) return legend.attention;
    return legend.risk;
  };

  return (
    <Card padded={false}>
      <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <Icons.IconSparkle size={12} color={colors.teal} />
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '2px' }}>{data.kicker}</Kicker>
            <div style={{ fontSize: '13px', color: colors.text2 }}>{data.subtitle}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.4fr)', minHeight: '360px' }}>
        {/* Left: list */}
        <div style={{ borderRight: `0.5px solid ${colors.border}` }}>
          {merchants.map((m, i) => {
            const isActive = (selected ?? merchants[0].slug) === m.slug;
            const band = bandFor(m.score);
            return (
              <button
                key={m.slug}
                onClick={() => setSelected(m.slug)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '14px 20px',
                  background: isActive ? colors.bg : 'transparent',
                  border: 'none',
                  borderBottom: i < merchants.length - 1 ? `0.5px solid ${colors.border}` : 'none',
                  borderLeft: `2px solid ${isActive ? colors.teal : 'transparent'}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', fontFamily: typography.family.mono, width: '42px' }}>
                  {m.score}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '2px' }}>{m.name}</div>
                  <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                    {band.label}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <TrendPill trend={m.trend} delta={m.trendDelta} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: detail */}
        <div style={{ padding: '22px 26px', overflowY: 'auto' }}>
          <HealthDetail record={selectedRecord} band={bandFor(selectedRecord.score)} />
        </div>
      </div>
    </Card>
  );
}

function HealthDetail({ record, band }: { record: MerchantHealthRecord; band: any }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>{record.name}</span>
        <Pill tone={band.tone}>{band.label}</Pill>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '14px' }}>
        <div style={{ fontSize: '48px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: typography.family.mono }}>
          {record.score}
        </div>
        <div style={{ fontSize: '12px', color: colors.text3 }}>of 100</div>
        <div style={{ flex: 1 }} />
        <TrendPill trend={record.trend} delta={record.trendDelta} window={record.trendWindow} />
      </div>

      <div style={{ fontSize: '13px', color: colors.ink, lineHeight: 1.6, marginBottom: '20px' }}>
        {record.summary}
      </div>

      {record.strengths.length > 0 && (
        <DetailBlock title="What's working" items={record.strengths} accent={colors.teal} />
      )}
      {record.concerns.length > 0 && (
        <DetailBlock title="Honest concerns" items={record.concerns} accent={colors.ink} />
      )}
      {record.observations.length > 0 && (
        <DetailBlock title="Worth knowing" items={record.observations} accent={colors.text2} muted />
      )}
    </>
  );
}

function DetailBlock({ title, items, accent, muted }: { title: string; items: string[]; accent: string; muted?: boolean }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '10px', color: accent, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '12px', color: muted ? colors.text2 : colors.ink, lineHeight: 1.55 }}>
            <span style={{ color: accent, flexShrink: 0 }}>·</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Inline pill showing trend direction + delta */
function TrendPill({ trend, delta, window }: { trend: string; delta: string; window?: string }) {
  const tone = trend === 'up' ? colors.teal : trend === 'down' ? colors.text2 : colors.text3;
  const arrow = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: tone, fontWeight: 500 }}>
      <span style={{ fontSize: '11px' }}>{arrow}</span>
      <span style={{ fontFamily: typography.family.mono }}>{delta}</span>
      {window && <span style={{ color: colors.text3, fontSize: '10px' }}>{window}</span>}
    </span>
  );
}

/** Compact score badge — use inline anywhere */
export function HealthScoreBadge({ slug }: { slug: string }) {
  const { data } = useAsync(() => configService.getHealth(), []);
  if (!data) return null;
  const record = data.merchants.find((m: any) => m.slug === slug);
  if (!record) return null;

  const legend: any = data.legend;
  const band =
    record.score >= legend.thriving.min ? legend.thriving :
    record.score >= legend.steady.min ? legend.steady :
    record.score >= legend.attention.min ? legend.attention :
    legend.risk;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontFamily: typography.family.mono,
        fontSize: '14px',
        fontWeight: 600,
        color: colors.ink,
      }}>{record.score}</span>
      <Pill tone={band.tone}>{band.label}</Pill>
    </div>
  );
}
