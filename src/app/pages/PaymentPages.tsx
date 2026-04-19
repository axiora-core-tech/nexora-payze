import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function PaymentPages() {
  const { data, loading, error, refetch } = useAsync(() => configService.getPaymentPages(), []);
  const [useCaseFilter, setUseCaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load pages — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading Payment Pages" />;

  const filtered = data.pages.filter((p: any) => {
    if (useCaseFilter !== 'all' && p.useCase !== useCaseFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('Page builder opened')}>New page</Button>
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginRight: '4px' }}>Use case</span>
        <FilterChip active={useCaseFilter === 'all'} onClick={() => setUseCaseFilter('all')}>All</FilterChip>
        {data.useCases.map((u: any) => <FilterChip key={u.id} active={useCaseFilter === u.id} onClick={() => setUseCaseFilter(u.id)}>{u.label}</FilterChip>)}
        <div style={{ marginLeft: '16px' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '11px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filtered.map((p: any) => <PageCard key={p.id} page={p} useCases={data.useCases} onClick={() => setSelected(p)} />)}
      </div>

      {selected && <PageDetailDrawer page={selected} fieldTypes={data.fieldTypes} onClose={() => setSelected(null)} />}
    </div>
  );
}

function FilterChip({ active, onClick, children }: any) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
      background: active ? 'rgba(28,111,107,0.08)' : 'transparent',
      color: active ? colors.teal : colors.text2,
      border: `0.5px solid ${active ? 'rgba(28,111,107,0.3)' : colors.border}`,
      cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  );
}

function PageCard({ page, useCases, onClick }: any) {
  const useCaseLabel = useCases.find((u: any) => u.id === page.useCase)?.label || page.useCase;
  const statusColor = page.status === 'active' ? colors.teal : page.status === 'draft' ? colors.text3 : '#B48C3C';
  return (
    <Card padded onClick={onClick} style={{ padding: '18px 20px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: radius.md, background: page.brandColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px', fontWeight: 600 }}>
          {page.merchantName.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, marginBottom: '3px', letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.title}</div>
          <div style={{ fontSize: '11px', color: colors.text2 }}>{page.merchantName} · {useCaseLabel}</div>
        </div>
        <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: `${statusColor}15`, color: statusColor, border: `0.5px solid ${statusColor}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{page.status}</span>
      </div>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5, marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{page.description}</div>
      <div style={{ padding: '8px 10px', background: colors.bg, borderRadius: radius.sm, fontSize: '10px', fontFamily: typography.family.mono, color: colors.text2, marginBottom: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {page.shortUrl}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '12px', borderTop: `0.5px solid ${colors.border}` }}>
        <PageStat label="Views"    value={page.analytics.views.toLocaleString('en-IN')} />
        <PageStat label="Paid"     value={page.analytics.paid.toLocaleString('en-IN')} />
        <PageStat label="Conv"     value={`${page.analytics.conversion.toFixed(1)}%`} tone="teal" />
        <PageStat label="Revenue"  value={page.analytics.revenue} />
      </div>
    </Card>
  );
}

function PageStat({ label, value, tone }: any) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: tone === 'teal' ? colors.teal : colors.ink, fontFamily: typography.family.mono }}>{value}</div>
    </div>
  );
}

function PageDetailDrawer({ page, fieldTypes, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '720px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ padding: '28px 32px 0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Payment Page</Kicker>
              <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em' }}>{page.title}</div>
              <div style={{ fontSize: '12px', color: colors.text2, marginTop: '2px' }}>{page.merchantName} · created {page.createdAt}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
              <Icons.IconX size={18} />
            </button>
          </div>

          <div style={{ padding: '10px 14px', background: colors.bg, borderRadius: radius.md, fontFamily: typography.family.mono, fontSize: '12px', color: colors.ink, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Icons.IconLink size={12} color={colors.text2} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.shortUrl}</span>
            <button onClick={() => { navigator.clipboard.writeText(`https://${page.shortUrl}`); toast.success('URL copied'); }} style={{ padding: '4px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontSize: '10px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>
          </div>
        </div>

        <div style={{ padding: '0 32px 24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left: form builder view */}
          <div>
            <Kicker style={{ marginBottom: '10px' }}>Form fields ({page.customFields.length})</Kicker>
            <div style={{ background: colors.bg, borderRadius: radius.md, border: `0.5px solid ${colors.border}`, padding: '6px' }}>
              {page.customFields.map((f: any, i: number) => {
                const fieldType = fieldTypes.find((ft: any) => ft.id === f.type);
                const Icon = getIcon(fieldType?.icon);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: i < page.customFields.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
                    <div style={{ width: '28px', height: '28px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {Icon ? <Icon size={13} color={colors.text2} /> : <span style={{ fontSize: '12px', color: colors.text3 }}>·</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{f.label} {f.required && <span style={{ color: '#D64545' }}>*</span>}</div>
                      <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{fieldType?.label || f.type}{f.note ? ' · ' + f.note : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" icon={<Icons.IconPlus size={11} />} style={{ marginTop: '10px' }} onClick={() => toast.success('Field picker opened')}>Add field</Button>
          </div>

          {/* Right: hosted page preview */}
          <div>
            <Kicker style={{ marginBottom: '10px' }}>Customer view preview</Kicker>
            <div style={{ background: '#fff', border: `0.5px solid ${colors.border}`, borderRadius: radius.lg, overflow: 'hidden', boxShadow: '0 20px 40px -15px rgba(26,26,26,0.12)' }}>
              <div style={{ padding: '14px 16px', background: page.brandColor, color: '#fff' }}>
                <div style={{ fontSize: '10px', opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{page.merchantName}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.01em' }}>{page.title}</div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55, marginBottom: '14px' }}>{page.description}</div>
                {page.type === 'fixed' && <div style={{ padding: '12px', background: colors.bg, borderRadius: radius.md, marginBottom: '14px' }}><div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Amount</div><div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{page.amount}</div></div>}
                {page.type === 'custom' && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Choose amount</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {page.suggestedAmounts?.map((a: number) => <span key={a} style={{ padding: '6px 10px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontSize: '11px', fontFamily: typography.family.mono, color: colors.ink }}>₹{a}</span>)}
                      <span style={{ padding: '6px 10px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontSize: '11px', color: colors.text3 }}>Custom</span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {page.customFields.slice(0, 3).map((f: any, i: number) => (
                    <div key={i}>
                      <div style={{ fontSize: '10px', color: colors.text3, marginBottom: '3px' }}>{f.label}{f.required ? ' *' : ''}</div>
                      <div style={{ height: '28px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm }} />
                    </div>
                  ))}
                  {page.customFields.length > 3 && <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>+ {page.customFields.length - 3} more fields</div>}
                </div>
                <button style={{ width: '100%', padding: '12px', background: page.brandColor, border: 'none', color: '#fff', borderRadius: radius.pill, fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>Pay {page.amount || '₹—'}</button>
                <div style={{ fontSize: '9px', color: colors.text3, textAlign: 'center', marginTop: '10px', fontFamily: typography.family.mono }}>Secured by Payze · PCI-DSS Level 1</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 32px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" icon={<Icons.IconExternal size={12} />} onClick={() => toast.success('Opening page in new tab')}>Open page</Button>
          <Button variant="secondary" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(`https://${page.shortUrl}`); toast.success('URL copied'); }}>Copy URL</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconQR size={12} />} onClick={() => toast.success('QR generated')}>QR code</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconSend size={12} />} onClick={() => toast.success('Opening send flow')}>Send to customer</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Edits saved')} style={{ marginLeft: 'auto' }}>Edit</Button>
        </div>
      </div>
    </div>
  );
}

function getIcon(name?: string): any {
  if (!name) return null;
  const map: Record<string, any> = {
    IconFileText: Icons.IconFileText, IconMail: Icons.IconMail, IconBell: Icons.IconBell,
    IconChevronDown: Icons.IconChevronDown, IconCheck: Icons.IconCheck,
    IconDownload: Icons.IconDownload, IconShield: Icons.IconShield,
  };
  return map[name] || null;
}
