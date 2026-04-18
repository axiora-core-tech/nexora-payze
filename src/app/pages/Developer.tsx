import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function Developer() {
  const { data, loading, error, refetch } = useAsync(() => configService.getDeveloper(), []);
  const { data: testData } = useAsync(() => configService.getTestScenarios(), []);
  const [env, setEnv] = useState('test');
  const [activeCategory, setActiveCategory] = useState<string>('routing');

  if (error) return <ErrorState message={`Couldn't load developer console — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading developer console" />;

  const { header, envs, keys, webhooks, codeSample, sdks } = data;
  const envKeys = keys.filter((k: any) => k.env === env);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const activeCategoryData = testData?.categories?.find((c: any) => c.id === activeCategory);

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
          {envs.map((e: string) => (
            <button key={e} onClick={() => setEnv(e)} style={{
              padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
              background: env === e ? colors.card : 'transparent',
              color: env === e ? colors.ink : colors.text2,
              border: env === e ? `0.5px solid ${colors.border}` : 'none',
              cursor: 'pointer', textTransform: 'uppercase', fontFamily: typography.family.mono,
              letterSpacing: '0.08em',
            }}>{e}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>API keys · {env}</Kicker>
          {envKeys.map((k: any) => (
            <div key={k.value} style={{ padding: '12px 0', borderBottom: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>{k.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: colors.bg, borderRadius: radius.sm }}>
                <code style={{ flex: 1, fontFamily: typography.family.mono, fontSize: '11px', color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.value}</code>
                <button onClick={() => copy(k.value, k.label)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: colors.text2 }}>
                  <Icons.IconCopy size={14} />
                </button>
              </div>
            </div>
          ))}
          <Button variant="secondary" size="sm" style={{ marginTop: '14px' }} onClick={() => toast.success('Keys rotated')}>Rotate keys</Button>
        </Card>

        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Webhook endpoints</Kicker>
          {webhooks.map((w: any, i: number) => (
            <div key={w.url} style={{
              padding: '12px 0',
              borderBottom: i < webhooks.length - 1 ? `0.5px solid ${colors.border}` : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <code style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.ink, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.url}</code>
                <div style={{ fontSize: '11px', color: colors.text3, marginTop: '4px' }}>{w.events} events · {w.lastDelivery}</div>
              </div>
              <Pill tone={w.health === 'Healthy' ? 'teal' : 'outline'}>{w.health}</Pill>
            </div>
          ))}
          <Button variant="secondary" size="sm" style={{ marginTop: '14px' }} icon={<Icons.IconPlus size={12} />}>Add endpoint</Button>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '20px' }}>
        <Card padded={false}>
          <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Node.js quickstart</div>
            <button onClick={() => copy(codeSample, 'Code sample')} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: colors.text2, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: 'inherit' }}>
              <Icons.IconCopy size={12} /> Copy
            </button>
          </div>
          <pre style={{
            margin: 0, padding: '20px 24px',
            background: '#1A1A1A', color: '#E6E6E4',
            fontFamily: typography.family.mono, fontSize: '12px',
            lineHeight: 1.7, overflow: 'auto',
            borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg,
          }}>{codeSample}</pre>
        </Card>

        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Install the SDK</Kicker>
          {sdks.map((s: any) => (
            <div key={s.lang} style={{ padding: '10px 0', borderBottom: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, marginBottom: '4px' }}>{s.lang}</div>
              <code style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2, padding: '4px 8px', background: colors.bg, borderRadius: radius.sm, display: 'inline-block' }}>{s.cmd}</code>
            </div>
          ))}
        </Card>
      </div>

      {testData && (
        <Card padded={false} style={{ marginTop: '20px' }}>
          <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>{testData.kicker}</Kicker>
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>Scenario library · {testData.categories.reduce((a: number, c: any) => a + c.scenarios.length, 0)} scripted scenarios</div>
              <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>{testData.introline}</div>
            </div>
            <Pill tone="outline">test mode · {env === 'test' ? 'active' : 'switch env'}</Pill>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 200px) minmax(0, 1fr)', minHeight: '360px' }}>
            {/* Category rail */}
            <div style={{ borderRight: `0.5px solid ${colors.border}`, background: colors.bg, padding: '10px 0' }}>
              {testData.categories.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '10px 20px',
                    background: activeCategory === c.id ? colors.card : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${activeCategory === c.id ? colors.teal : 'transparent'}`,
                    fontSize: '12px', fontWeight: 500,
                    color: activeCategory === c.id ? colors.ink : colors.text2,
                    textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>{c.scenarios.length}</span>
                </button>
              ))}
            </div>

            {/* Scenarios */}
            <div style={{ padding: '14px 20px', overflowY: 'auto' }}>
              {activeCategoryData?.scenarios.map((s: any, i: number) => (
                <div key={s.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  gap: '16px', alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i < activeCategoryData.scenarios.length - 1 ? `0.5px solid ${colors.border}` : 'none',
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '3px' }}>{s.title}</div>
                    <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5, marginBottom: '6px' }}>{s.description}</div>
                    <code style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3, padding: '3px 8px', background: colors.bg, borderRadius: radius.sm, border: `0.5px solid ${colors.border}`, display: 'inline-block' }}>
                      {s.trigger}
                    </code>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.success(`Replaying "${s.title}" — deterministic response in 0.3s`)}
                    icon={<Icons.IconSend size={12} />}
                  >
                    Replay
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '12px 24px', borderTop: `0.5px solid ${colors.border}`, background: colors.bg, fontSize: '11px', color: colors.text2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <span>{testData.replay.hint}</span>
            <a href={testData.replay.docsLink} style={{ fontSize: '11px', color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Testing docs <Icons.IconArrowUpRight size={11} />
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
