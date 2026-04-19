import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function ReceiptTemplates() {
  const { data, loading, error, refetch } = useAsync(() => configService.getReceiptTemplates(), []);
  const [selected, setSelected] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load receipts — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading receipt templates" />;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('Template editor opened')}>New template</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => (
          <Card key={s.label} padded style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {data.templates.map((t: any) => (
          <Card key={t.id} padded onClick={() => setSelected(t)} style={{ padding: '20px 22px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: radius.md, background: t.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, fontFamily: typography.family.mono, flexShrink: 0, letterSpacing: '-0.02em' }}>{t.logoText}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.005em' }}>{t.name}</span>
                  {t.isActive && <Pill tone="teal">active</Pill>}
                </div>
                <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5, marginBottom: '6px' }}>{t.description}</div>
                <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>Last edited {t.lastEdited}</div>
              </div>
            </div>
            <div style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2, lineHeight: 1.55, fontStyle: 'italic', marginBottom: '10px' }}>Subject: {t.subjectLine.replace(/\{\{\w+\}\}/g, m => m)}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '10px', borderTop: `0.5px solid ${colors.border}` }}>
              <StatTile label="Sent · 30d" value={t.stats.sent30d.toLocaleString('en-IN')} />
              <StatTile label="Open rate"  value={`${t.stats.openRate.toFixed(1)}%`} tone="teal" />
              <StatTile label="Click rate" value={`${t.stats.clickRate.toFixed(1)}%`} />
            </div>
          </Card>
        ))}
      </div>

      {selected && <TemplateDrawer tmpl={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatTile({ label, value, tone }: any) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: tone === 'teal' ? colors.teal : colors.ink, fontFamily: typography.family.mono }}>{value}</div>
    </div>
  );
}

function TemplateDrawer({ tmpl, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '720px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', minWidth: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: radius.md, background: tmpl.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, fontFamily: typography.family.mono, flexShrink: 0 }}>{tmpl.logoText}</div>
              <div style={{ minWidth: 0 }}>
                <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Receipt template</Kicker>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.005em' }}>{tmpl.name}</div>
                <div style={{ fontSize: '11px', color: colors.text2, marginTop: '2px' }}>{tmpl.description}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
              <Icons.IconX size={18} />
            </button>
          </div>

          {/* Subject */}
          <Kicker style={{ marginBottom: '8px' }}>Subject line</Kicker>
          <div style={{ padding: '10px 14px', background: colors.bg, borderRadius: radius.md, fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '18px' }}>{tmpl.subjectLine}</div>

          {/* Body + preview */}
          <Kicker style={{ marginBottom: '10px' }}>Body preview</Kicker>
          <div style={{ background: '#fff', border: `0.5px solid ${colors.border}`, borderRadius: radius.md, overflow: 'hidden', marginBottom: '18px' }}>
            <div style={{ padding: '14px 18px', background: tmpl.brandColor, color: '#fff', fontSize: '13px', fontWeight: 600, fontFamily: typography.family.mono, letterSpacing: '-0.02em' }}>{tmpl.logoText}</div>
            <div style={{ padding: '20px 22px', whiteSpace: 'pre-line', fontSize: '12px', color: colors.ink, lineHeight: 1.65 }}>{tmpl.bodyPreview}</div>
          </div>

          {/* Merge fields */}
          <Kicker style={{ marginBottom: '10px' }}>Available merge fields</Kicker>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {tmpl.mergeFields.map((m: string) => (
              <span key={m} style={{ fontSize: '10px', padding: '3px 8px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontFamily: typography.family.mono, color: colors.ink }}>{m}</span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '16px', borderTop: `0.5px solid ${colors.border}` }}>
            <Button variant="primary" size="sm" onClick={() => toast.success('Template edited')}>Edit template</Button>
            <Button variant="secondary" size="sm" icon={<Icons.IconSend size={12} />} onClick={() => toast.success('Test email sent to you')}>Send test</Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success(tmpl.isActive ? 'Template deactivated' : 'Template set as active default')}>
              {tmpl.isActive ? 'Deactivate' : 'Set as active'}
            </Button>
            <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => toast.success('Template duplicated')}>Duplicate</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
