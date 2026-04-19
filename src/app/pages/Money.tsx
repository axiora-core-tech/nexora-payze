import React from 'react';
import { useSearchParams } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Transactions } from './Transactions';
import { Settlements } from './Settlements';

type TabId = 'payments' | 'payouts';

export function Money() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as TabId) || 'payments';

  const setTab = (next: TabId) => {
    if (next === 'payments') setSearchParams({});
    else setSearchParams({ tab: next });
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <SectionTabs active={tab} onChange={setTab} />
      {tab === 'payments' && <Transactions />}
      {tab === 'payouts'  && <Settlements />}
    </div>
  );
}

function SectionTabs({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  const tabs: { id: TabId; label: string; hint: string }[] = [
    { id: 'payments', label: 'Payments', hint: 'Individual transactions' },
    { id: 'payouts',  label: 'Payouts',  hint: 'Batched settlements' },
  ];
  return (
    <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', padding: '4px', background: colors.bg, borderRadius: radius.pill, width: 'fit-content' }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: '7px 16px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
            background: isActive ? colors.card : 'transparent',
            color: isActive ? colors.ink : colors.text2,
            border: isActive ? `0.5px solid ${colors.border}` : 'none',
            boxShadow: isActive ? colors.shadow : 'none',
            cursor: 'pointer', fontFamily: typography.family.sans,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span>{t.label}</span>
            <span style={{ fontSize: '10px', color: colors.text3, fontWeight: 400 }}>· {t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
