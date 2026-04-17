import React from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';

const team = [
  { initials: 'KV', name: 'Kavya Venkatesh', email: 'kavya@payze.com', role: 'Owner', last: 'Now', you: true },
  { initials: 'AR', name: 'Arjun Reddy', email: 'arjun@payze.com', role: 'Admin', last: '2h ago' },
  { initials: 'PM', name: 'Priya Menon', email: 'priya@payze.com', role: 'Developer', last: '1d ago' },
  { initials: 'SG', name: 'Saurabh Gupta', email: 'saurabh@payze.com', role: 'Support', last: '4h ago' },
  { initials: 'NT', name: 'Nisha Trivedi', email: 'nisha@payze.com', role: 'Analyst', last: '3d ago' },
];

export function Admin() {
  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Team & admin</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>People</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Who has access and what they can do.
          </div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />}>Invite member</Button>
      </div>

      <Card padded={false}>
        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Member</div>
          <div>Role</div>
          <div>Last active</div>
          <div></div>
        </div>
        {team.map((m, i) => (
          <div key={m.email} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.4fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < team.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                {m.initials}
              </div>
              <div>
                <div style={{ color: colors.ink, fontWeight: 500 }}>
                  {m.name} {m.you && <span style={{ color: colors.text3, fontWeight: 400, fontSize: '11px' }}>· you</span>}
                </div>
                <div style={{ color: colors.text3, fontSize: '11px' }}>{m.email}</div>
              </div>
            </div>
            <div>
              <Pill tone={m.role === 'Owner' ? 'ink' : 'outline'}>{m.role}</Pill>
            </div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{m.last}</div>
            <div style={{ textAlign: 'right' }}>
              {!m.you && (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}>
                  <Icons.IconSettings size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '16px' }}>Two-factor</Kicker>
          <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '4px' }}>All members require 2FA</div>
          <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>4 of 5 members have 2FA enabled.</div>
          <Button variant="secondary" size="sm">Manage policy</Button>
        </Card>

        <Card padded>
          <Kicker style={{ marginBottom: '16px' }}>Audit log</Kicker>
          <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '4px' }}>Every action recorded</div>
          <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>1,284 events in the last 30 days.</div>
          <Button variant="secondary" size="sm">Open log</Button>
        </Card>
      </div>
    </div>
  );
}
