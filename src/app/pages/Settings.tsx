import React from 'react';
import { useSearchParams } from 'react-router';
import { SectionTabs } from '../../design/primitives';
import { Admin } from './Admin';
<<<<<<< HEAD
import { DeveloperAndWebhooks } from './DeveloperAndWebhooks';
import { ReceiptTemplates } from './ReceiptTemplates';

type TabId = 'team' | 'developer' | 'receipts';
=======
import { Developer } from './Developer';
import { Webhooks } from './Webhooks';

type TabId = 'team' | 'developer' | 'webhooks';
>>>>>>> be80785912944f49b03441a702d8b5ded786988a

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
<<<<<<< HEAD
          { id: 'developer', label: 'Developer', hint: 'API keys · webhooks · test mode' },
          { id: 'receipts',  label: 'Receipts',  hint: 'Branded confirmation emails' },
        ]}
      />
      {tab === 'team'      && <Admin />}
      {tab === 'developer' && <DeveloperAndWebhooks />}
      {tab === 'receipts'  && <ReceiptTemplates />}
=======
          { id: 'developer', label: 'Developer', hint: 'API keys, test mode' },
          { id: 'webhooks',  label: 'Webhooks',  hint: 'Event subscriptions · deliveries' },
        ]}
      />
      {tab === 'team'      && <Admin />}
      {tab === 'developer' && <Developer />}
      {tab === 'webhooks'  && <Webhooks />}
>>>>>>> be80785912944f49b03441a702d8b5ded786988a
    </div>
  );
}
