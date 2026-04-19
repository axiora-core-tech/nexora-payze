import React from 'react';
import { useSearchParams } from 'react-router';
import { SectionTabs } from '../../design/primitives';
import { Admin } from './Admin';
import { DeveloperAndWebhooks } from './DeveloperAndWebhooks';
import { ReceiptTemplates } from './ReceiptTemplates';

type TabId = 'team' | 'developer' | 'receipts';

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Backwards-compat: old 'webhooks' links land on developer
  const rawTab = searchParams.get('tab');
  const tab: TabId = rawTab === 'webhooks' ? 'developer' : ((rawTab as TabId) || 'team');

  const setTab = (next: TabId) => {
    if (next === 'team') setSearchParams({});
    else setSearchParams({ tab: next });
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <SectionTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'team',      label: 'Team',      hint: 'Users, roles, billing' },
          { id: 'developer', label: 'Developer', hint: 'API keys · webhooks · test mode' },
          { id: 'receipts',  label: 'Receipts',  hint: 'Branded confirmation emails' },
        ]}
      />
      {tab === 'team'      && <Admin />}
      {tab === 'developer' && <DeveloperAndWebhooks />}
      {tab === 'receipts'  && <ReceiptTemplates />}
    </div>
  );
}
