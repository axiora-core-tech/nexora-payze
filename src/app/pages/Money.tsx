import React from 'react';
import { useSearchParams } from 'react-router';
import { SectionTabs } from '../../design/primitives';
import { Transactions } from './Transactions';
import { Settlements } from './Settlements';
import { Refunds } from './Refunds';
import { Dunning } from './Dunning';
import { SmartCollect } from './SmartCollect';
import { Payouts } from './Payouts';

type TabId = 'payments' | 'smartcollect' | 'settlements' | 'payouts' | 'refunds' | 'dunning';

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
          { id: 'payments',     label: 'Payments',      hint: 'Inbound transactions' },
          { id: 'smartcollect', label: 'Smart Collect', hint: 'Virtual accounts · NEFT/IMPS' },
          { id: 'settlements',  label: 'Settlements',   hint: 'Your earnings · to your bank' },
          { id: 'payouts',      label: 'Payouts',       hint: 'Pay vendors · IMPS/UPI/NEFT' },
          { id: 'refunds',      label: 'Refunds',       hint: 'Issue · track · reconcile' },
          { id: 'dunning',      label: 'Dunning',       hint: 'Smart retry · recovery' },
        ]}
      />
      {tab === 'payments'     && <Transactions />}
      {tab === 'smartcollect' && <SmartCollect />}
      {tab === 'settlements'  && <Settlements />}
      {tab === 'payouts'      && <Payouts />}
      {tab === 'refunds'      && <Refunds />}
      {tab === 'dunning'      && <Dunning />}
    </div>
  );
}
