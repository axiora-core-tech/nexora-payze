import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

const team = [
  { initials: 'KV', name: 'Kavya Venkatesh', email: 'kavya@payze.com', role: 'Owner', last: 'Now', twoFa: true, you: true },
  { initials: 'AR', name: 'Arjun Reddy', email: 'arjun@payze.com', role: 'Admin', last: '2h ago', twoFa: true },
  { initials: 'PM', name: 'Priya Menon', email: 'priya@payze.com', role: 'Developer', last: '1d ago', twoFa: true },
  { initials: 'SG', name: 'Saurabh Gupta', email: 'saurabh@payze.com', role: 'Support', last: '4h ago', twoFa: true },
  { initials: 'NT', name: 'Nisha Trivedi', email: 'nisha@payze.com', role: 'Analyst', last: '3d ago', twoFa: false },
];

const auditLog = [
  { time: '14:32', actor: 'Arjun Reddy', action: 'Updated risk rule', detail: 'velocity_threshold: 4 → 5' },
  { time: '12:18', actor: 'Kavya Venkatesh', action: 'Onboarded merchant', detail: 'Razorpay Technologies · /t/razorpay' },
  { time: '11:45', actor: 'Priya Menon', action: 'Rotated API key', detail: 'sk_live_••••_a1b2' },
  { time: '09:22', actor: 'Saurabh Gupta', action: 'Resolved dispute', detail: 'dp_9010 · ₹22,000 · won' },
];

export function Admin() {
  const [showInvite, setShowInvite] = useState(false);
  const [tab, setTab] = useState<'team' | 'audit' | 'security'>('team');

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Team & admin</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>People and access</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Who has access, what they do, and when.</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setShowInvite(true)}>Invite member</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Team members" value="5" sub="1 owner · 4 others" />
        <StatCard label="2FA coverage" value="4 of 5" sub="80% enabled" />
        <StatCard label="Audit events, 30d" value="1,284" sub="normal activity" />
        <StatCard label="Active API keys" value="6" sub="2 test · 4 live" />
      </div>

      <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content', marginBottom: '20px' }}>
        {[{ id: 'team', label: 'Team' }, { id: 'audit', label: 'Audit log' }, { id: 'security', label: 'Security' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
            background: tab === t.id ? colors.card : 'transparent',
            color: tab === t.id ? colors.ink : colors.text2,
            border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
            cursor: 'pointer', fontFamily: typography.family.sans,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'team' && (
        <Card padded={false}>
          <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <div>Member</div><div>Role</div><div>2FA</div><div>Last active</div><div></div>
          </div>
          {team.map((m, i) => (
            <div key={m.email} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 0.4fr', gap: '16px', padding: '16px 24px', borderBottom: i < team.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>{m.initials}</div>
                <div>
                  <div style={{ color: colors.ink, fontWeight: 500 }}>
                    {m.name} {m.you && <span style={{ color: colors.text3, fontWeight: 400, fontSize: '11px' }}>· you</span>}
                  </div>
                  <div style={{ color: colors.text3, fontSize: '11px' }}>{m.email}</div>
                </div>
              </div>
              <div><Pill tone={m.role === 'Owner' ? 'ink' : 'outline'}>{m.role}</Pill></div>
              <div>{m.twoFa ? <Pill tone="teal">Enabled</Pill> : <Pill tone="outline">Disabled</Pill>}</div>
              <div style={{ color: colors.text2, fontSize: '12px' }}>{m.last}</div>
              <div style={{ textAlign: 'right' }}>
                {!m.you && <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}><Icons.IconSettings size={14} /></button>}
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'audit' && (
        <Card padded={false}>
          <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Audit trail</div>
            <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Audit log exported')}>Export</Button>
          </div>
          {auditLog.map((a, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: i < auditLog.length - 1 ? `0.5px solid ${colors.border}` : 'none', display: 'grid', gridTemplateColumns: '0.6fr 1fr 1.2fr 2fr', gap: '16px', alignItems: 'center', fontSize: '13px' }}>
              <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{a.time}</div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{a.actor}</div>
              <div style={{ color: colors.text2 }}>{a.action}</div>
              <div style={{ color: colors.text3, fontSize: '11px', fontFamily: typography.family.mono }}>{a.detail}</div>
            </div>
          ))}
        </Card>
      )}

      {tab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card padded>
            <Kicker style={{ marginBottom: '14px' }}>Two-factor authentication</Kicker>
            <div style={{ fontSize: '14px', color: colors.ink, fontWeight: 500, marginBottom: '6px' }}>Required for all members</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>4 of 5 members have 2FA enabled.</div>
            <Button variant="secondary" size="sm">Manage policy</Button>
          </Card>
          <Card padded>
            <Kicker style={{ marginBottom: '14px' }}>SAML SSO</Kicker>
            <div style={{ fontSize: '14px', color: colors.ink, fontWeight: 500, marginBottom: '6px' }}>Not configured</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>Available on Scale plans.</div>
            <Button variant="secondary" size="sm">Configure SSO</Button>
          </Card>
          <Card padded>
            <Kicker style={{ marginBottom: '14px' }}>Session policy</Kicker>
            <div style={{ fontSize: '14px', color: colors.ink, fontWeight: 500, marginBottom: '6px' }}>8-hour idle timeout</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>Sessions expire after 8 hours of inactivity.</div>
            <Button variant="secondary" size="sm">Edit policy</Button>
          </Card>
          <Card padded>
            <Kicker style={{ marginBottom: '14px' }}>IP allowlist</Kicker>
            <div style={{ fontSize: '14px', color: colors.ink, fontWeight: 500, marginBottom: '6px' }}>Disabled</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>Restrict API access to specific IPs.</div>
            <Button variant="secondary" size="sm">Enable allowlist</Button>
          </Card>
        </div>
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '440px', maxWidth: '100%', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.lg, padding: '28px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Invite member</Kicker>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink }}>Add someone new</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}><Icons.IconX size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
              <option>Admin</option><option>Developer</option><option>Support</option><option>Analyst</option><option>Viewer</option>
            </select>
          </div>
          <div style={{ fontSize: '11px', color: colors.text3, padding: '10px 14px', background: colors.bg, borderRadius: radius.sm, lineHeight: 1.6 }}>
            They'll receive an email and must set up 2FA at first login.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast.success(`Invite sent to ${email || 'colleague@company.com'}`); onClose(); }} disabled={!email}>Send invite</Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
