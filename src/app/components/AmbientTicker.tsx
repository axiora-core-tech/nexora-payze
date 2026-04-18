import React, { useEffect, useState } from 'react';
import { colors, typography } from '../../design/tokens';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function AmbientTicker() {
  const { data } = useAsync(() => configService.getTicker(), []);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!data) return;
    const cadence = data.cadenceMs || 4200;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % data.events.length);
        setFading(false);
      }, 240);
    }, cadence);
    return () => clearInterval(interval);
  }, [data]);

  if (!data || !data.events.length) return null;

  const current = data.events[index];
  const dotColor = current.icon === 'teal' ? colors.teal : current.icon === 'blocked' ? colors.text2 : colors.ink;
  const textColor = current.icon === 'blocked' ? colors.text2 : colors.ink;

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: '64px', right: 0,
        height: '32px',
        background: colors.card,
        borderTop: `0.5px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 20px',
        fontSize: '11px',
        zIndex: 30,
        overflow: 'hidden',
      }}
      aria-label="Live platform activity"
    >
      <span
        style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: dotColor,
          boxShadow: current.icon === 'teal' ? `0 0 0 3px ${colors.tealTintStrong}` : 'none',
          animation: 'payze-pulse-dot 2s ease-in-out infinite',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: typography.family.mono,
          fontSize: '9px',
          color: colors.text3,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 500,
          flexShrink: 0,
        }}
      >LIVE</span>
      <span
        style={{
          color: textColor,
          fontWeight: current.icon === 'teal' ? 500 : 400,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.24s ease-out',
          flex: 1, minWidth: 0,
        }}
      >{current.text}</span>
      <span
        style={{
          fontFamily: typography.family.mono,
          fontSize: '9px',
          color: colors.text3,
          flexShrink: 0,
        }}
      >{index + 1}/{data.events.length}</span>
    </div>
  );
}
