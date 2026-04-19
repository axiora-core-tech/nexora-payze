import React from 'react';
import { useSearchParams } from 'react-router';
import { SectionTabs } from '../../design/primitives';
import { Admin } from './Admin';
import { Developer } from './Developer';
import { Webhooks } from './Webhooks';

type TabId = 'team' | 'developer' | 'webhooks';

export function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as TabId) || 'team';

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
          { id: 'developer', label: 'Developer', hint: 'API keys, test mode' },
          { id: 'webhooks',  label: 'Webhooks',  hint: 'Event subscriptions · deliveries' },
        ]}
      />
      {tab === 'team'      && <Admin />}
      {tab === 'developer' && <Developer />}
      {tab === 'webhooks'  && <Webhooks />}
    </div>
  );
}
