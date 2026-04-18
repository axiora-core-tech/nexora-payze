import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

type Lane = { id: string; label: string; color: string };
type TimelineEvent = { t: number; lane: string; label: string; detail: string; kind: string };

export function TimelineView({ txnId, onClose }: { txnId: string; onClose: () => void }) {
  const { data } = useAsync(() => configService.getTimeline(), []);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  if (!data) return null;

  const trace = data.tracesByTxnId?.[txnId];
  if (!trace) {
    return (
      <div onClick={onClose} style={backdropStyle}>
        <div onClick={e => e.stopPropagation()} style={{ ...shellStyle, padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '12px' }}>{data.fallback}</div>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const lanes: Lane[] = trace.lanes;
  const events: TimelineEvent[] = trace.events;
  const maxT = Math.max(...events.map(e => e.t));
  const outcome = trace.outcome;
  const outcomeTone = outcome === 'succeeded' ? 'teal' : outcome === 'routed' ? 'teal' : 'outline';

  // Chart layout
  const LEFT_LABEL_WIDTH = 140;
  const CHART_HEIGHT = 60 + lanes.length * 64;
  const LANE_HEIGHT = 64;

  const eventXPct = (t: number) => (t / maxT) * 100;

  return (
    <div onClick={onClose} style={backdropStyle}>
      <div onClick={e => e.stopPropagation()} style={shellStyle}>
        {/* Header */}
        <div style={{ padding: '22px 28px 16px 28px', borderBottom: `0.5px solid ${colors.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '11px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.IconClock size={11} color={colors.teal} />
                {data.kicker}
              </div>
              <div style={{ fontSize: '17px', fontWeight: 600, color: colors.ink, marginBottom: '4px', letterSpacing: '-0.015em' }}>{trace.title}</div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: colors.text2, alignItems: 'center' }}>
                <span><span style={{ color: colors.text3 }}>Started</span> <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>{trace.startedAt}</span></span>
                <span style={{ color: colors.borderHover }}>·</span>
                <span><span style={{ color: colors.text3 }}>Ended</span> <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>{trace.endedAt}</span></span>
                <span style={{ color: colors.borderHover }}>·</span>
                <span><span style={{ color: colors.text3 }}>Duration</span> <span style={{ fontFamily: typography.family.mono, color: colors.ink, fontWeight: 600 }}>{trace.duration}</span></span>
                <Pill tone={outcomeTone as any}>{outcome}</Pill>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px', flexShrink: 0 }}>
              <Icons.IconX size={18} />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div style={{ flex: 1, overflow: 'auto', padding: '30px 28px', background: colors.bg }}>
          <div style={{ background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, padding: '24px' }}>
            <div style={{ display: 'flex', gap: '0', position: 'relative', minHeight: `${CHART_HEIGHT}px` }}>
              {/* Left label column */}
              <div style={{ width: `${LEFT_LABEL_WIDTH}px`, flexShrink: 0, paddingTop: '40px' }}>
                {lanes.map((lane, i) => (
                  <div key={lane.id} style={{
                    height: `${LANE_HEIGHT}px`,
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    paddingRight: '14px', borderTop: i === 0 ? `0.5px solid ${colors.border}` : `0.5px dashed ${colors.border}`,
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: colors.ink, textAlign: 'right' }}>
                      {lane.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Timeline lanes */}
              <div style={{ flex: 1, position: 'relative', minHeight: `${CHART_HEIGHT}px` }}>
                {/* Time axis */}
                <div style={{ height: '40px', position: 'relative', borderBottom: `0.5px solid ${colors.border}`, marginBottom: 0 }}>
                  {[0, 0.25, 0.5, 0.75, 1].map(frac => {
                    const ms = Math.round(maxT * frac);
                    return (
                      <div key={frac} style={{
                        position: 'absolute', left: `${frac * 100}%`, top: 0, height: '100%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono,
                        display: 'flex', alignItems: 'center',
                      }}>
                        {ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`}
                      </div>
                    );
                  })}
                  {[0.25, 0.5, 0.75].map(frac => (
                    <div key={frac} style={{
                      position: 'absolute', left: `${frac * 100}%`, top: '24px',
                      width: '0.5px', height: `${CHART_HEIGHT - 24}px`, background: colors.border,
                    }} />
                  ))}
                </div>

                {/* Lanes */}
                {lanes.map((lane, i) => (
                  <div key={lane.id} style={{
                    height: `${LANE_HEIGHT}px`, position: 'relative',
                    borderTop: i === 0 ? `0.5px solid ${colors.border}` : `0.5px dashed ${colors.border}`,
                  }} />
                ))}

                {/* Events — rendered over lanes */}
                {events.map((e, i) => {
                  const laneIdx = lanes.findIndex(l => l.id === e.lane);
                  if (laneIdx < 0) return null;
                  const x = eventXPct(e.t);
                  const y = 40 + (laneIdx * LANE_HEIGHT) + LANE_HEIGHT / 2;
                  const dotColor = e.kind === 'teal' ? colors.teal : e.kind === 'blocked' ? colors.text2 : colors.ink;
                  const isSelected = selectedEvent === i;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedEvent(selectedEvent === i ? null : i)}
                      style={{
                        position: 'absolute',
                        left: `calc(${x}% - 7px)`, top: `${y - 7}px`,
                        width: '14px', height: '14px',
                        borderRadius: '50%',
                        background: dotColor,
                        border: e.kind === 'blocked' ? `1px solid ${colors.card}` : 'none',
                        padding: 0, cursor: 'pointer',
                        boxShadow: isSelected ? `0 0 0 4px ${colors.tealTintStrong}` : `0 0 0 3px ${colors.card}`,
                        transition: 'box-shadow 0.15s',
                        zIndex: 10,
                        textDecoration: e.kind === 'blocked' ? 'line-through' : 'none',
                      }}
                      aria-label={e.label}
                      title={`${e.label} · ${e.t}ms`}
                    />
                  );
                })}

                {/* Event connectors — lines between events in the same flow */}
                <svg style={{ position: 'absolute', inset: 0, top: '40px', pointerEvents: 'none' }} width="100%" height={CHART_HEIGHT - 40}>
                  {events.slice(0, -1).map((e, i) => {
                    const next = events[i + 1];
                    const laneA = lanes.findIndex(l => l.id === e.lane);
                    const laneB = lanes.findIndex(l => l.id === next.lane);
                    if (laneA < 0 || laneB < 0) return null;
                    const yA = laneA * LANE_HEIGHT + LANE_HEIGHT / 2;
                    const yB = laneB * LANE_HEIGHT + LANE_HEIGHT / 2;
                    return (
                      <line
                        key={i}
                        x1={`${eventXPct(e.t)}%`} y1={yA}
                        x2={`${eventXPct(next.t)}%`} y2={yB}
                        stroke={colors.borderHover} strokeWidth="1" strokeDasharray="2,3"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Legend */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', gap: '18px', fontSize: '11px', color: colors.text2, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.ink }} />
                Neutral event
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.teal }} />
                Payze decision
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.text2 }} />
                Blocked / failure
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '10px', color: colors.text3 }}>Click any dot for details</div>
            </div>
          </div>
        </div>

        {/* Selected event detail panel */}
        <div style={{ flexShrink: 0, borderTop: `0.5px solid ${colors.border}`, padding: '14px 28px', background: colors.card, minHeight: '74px' }}>
          {selectedEvent !== null ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3 }}>
                  t+{events[selectedEvent].t}ms
                </span>
                <span style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                  {lanes.find(l => l.id === events[selectedEvent].lane)?.label}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{events[selectedEvent].label}</div>
              <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>{events[selectedEvent].detail}</div>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: colors.text3, display: 'flex', alignItems: 'center', gap: '8px', height: '100%' }}>
              <Icons.IconSparkle size={12} color={colors.text3} />
              Click any event dot above for detail
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ flexShrink: 0, padding: '12px 28px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '11px', color: colors.text3 }}>
            {events.length} events across {lanes.length} lanes · {trace.duration} total
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/app/transactions/${txnId}/timeline`);
              toast.success('Timeline link copied');
            }}>
              Share link
            </Button>
            <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Timeline exported as PNG')}>
              Export
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.5)', backdropFilter: 'blur(3px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  zIndex: 110,
};

const shellStyle: React.CSSProperties = {
  width: '1080px', maxWidth: '100%', maxHeight: '92vh',
  background: colors.card, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.lg, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
  overflow: 'hidden', display: 'flex', flexDirection: 'column',
};
