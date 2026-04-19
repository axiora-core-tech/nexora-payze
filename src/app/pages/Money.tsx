import React from 'react';
import { useSearchParams } from 'react-router';
import { SectionTabs } from '../../design/primitives';
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
      <SectionTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'payments', label: 'Payments', hint: 'Individual transactions' },
          { id: 'payouts',  label: 'Payouts',  hint: 'Batched settlements' },
        ]}
      />
      {tab === 'payments' && <Transactions />}
      {tab === 'payouts'  && <Settlements />}
    </div>
  );
}
