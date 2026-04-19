import React from 'react';
import { useSearchParams } from 'react-router';
import { SectionTabs } from '../../design/primitives';
import { Transactions } from './Transactions';
import { Settlements } from './Settlements';
import { Refunds } from './Refunds';

type TabId = 'payments' | 'payouts' | 'refunds';

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
          { id: 'refunds',  label: 'Refunds',  hint: 'Issue · track · reconcile' },
        ]}
      />
      {tab === 'payments' && <Transactions />}
      {tab === 'payouts'  && <Settlements />}
      {tab === 'refunds'  && <Refunds />}
    </div>
  );
}
