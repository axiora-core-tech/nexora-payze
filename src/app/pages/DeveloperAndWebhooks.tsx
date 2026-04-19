import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Developer } from './Developer';
import { Webhooks } from './Webhooks';

type InnerTab = 'api' | 'webhooks';

export function DeveloperAndWebhooks() {
  const [tab, setTab] = useState<InnerTab>('api');

  const tabs: Array<{ id: InnerTab; label: string; hint: string }> = [
    { id: 'api',      label: 'API & SDKs',  hint: 'Keys · idempotency · test cards' },
    { id: 'webhooks', label: 'Webhooks',    hint: 'Endpoints · deliveries · events' },
  ];

  return (
    <div style={{ animation: 'payze-fadein 0.3s ease-out' }}>
      {/* Inner pill-tab nav */}
      <div style={{
        display: 'inline-flex', gap: '4px',
        background: colors.bg, padding: '4px',
        borderRadius: radius.pill, border: `0.5px solid ${colors.border}`,
        marginBottom: '22px',
      }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 16px', borderRadius: radius.pill,
                fontSize: '12px', fontWeight: active ? 600 : 500,
                background: active ? 'rgba(28,111,107,0.09)' : 'transparent',
                color: active ? colors.teal : colors.text2,
                border: active ? '0.5px solid rgba(28,111,107,0.3)' : '0.5px solid transparent',
                cursor: 'pointer', fontFamily: typography.family.sans,
                transition: 'all 0.18s ease',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
              <span>{t.label}</span>
              <span style={{ fontSize: '10px', color: active ? colors.teal : colors.text3, opacity: 0.75 }}>· {t.hint}</span>
            </button>
          );
        })}
      </div>

      {tab === 'api'      && <Developer />}
      {tab === 'webhooks' && <Webhooks />}
    </div>
  );
}
