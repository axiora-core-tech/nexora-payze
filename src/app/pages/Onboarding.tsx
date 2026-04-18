import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { useAsync } from '../../hooks/useAsync';
import { tenantService, configService } from '../../services';
import { toast } from 'sonner';

type Stage = 'welcome' | 'wizard' | 'activating' | 'celebration';

const iconMap: Record<string, any> = {
  IconDeveloper: Icons.IconDeveloper,
  IconLedger: Icons.IconLedger,
  IconTenants: Icons.IconTenants,
  IconUser: Icons.IconUser,
  IconShield: Icons.IconShield,
  IconInvoice: Icons.IconInvoice,
  IconSettlements: Icons.IconSettlements,
  IconPlus: Icons.IconPlus,
};

export function Onboarding() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(() => configService.getOnboarding(), []);
  const [stage, setStage] = useState<Stage>('welcome');
  const [step, setStep] = useState(0);

  // Form state
  const [presetId, setPresetId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState('Private Limited');
  const [website, setWebsite] = useState('');
  const [pan, setPan] = useState('');
  const [signatory, setSignatory] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [cadence, setCadence] = useState('T+1 (next business day)');
  const [brandColor, setBrandColor] = useState('#1C6F6B');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Scale'>('Growth');
  const [methods, setMethods] = useState<string[]>([]);
  const [industry, setIndustry] = useState('SaaS');

  if (error) return <ErrorState message={`Couldn't load onboarding — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading onboarding" />;

  const preset = data.industryPresets.find((p: any) => p.id === presetId);
  const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // When a preset is picked, apply its defaults
  const pickPreset = (id: string) => {
    setPresetId(id);
    const p = data.industryPresets.find((x: any) => x.id === id);
    if (p) {
      setMethods(p.defaults.methods);
      setCadence(p.defaults.settlementCadence);
      setPlan(p.defaults.plan);
      setBrandColor(p.defaults.brandColor);
      setIndustry(p.defaults.industry);
    }
  };

  const canContinue = () => {
    if (stage !== 'wizard') return true;
    if (step === 0) return !!(presetId && name && slug && website);
    if (step === 1) return !!(pan && signatory);
    if (step === 2) return !!(accountNumber && ifsc);
    return true;
  };

  const activate = async () => {
    setStage('activating');
  };

  const finalizeAndRedirect = async () => {
    try {
      await tenantService.create({ name, slug, industry, brandColor, plan, status: 'Active', gmv30d: 0 });
      setStage('celebration');
    } catch {
      toast.error('Activation failed — please retry');
      setStage('wizard');
    }
  };

  // ── Stage 1: Welcome ───────────────────────────────────────────────
  if (stage === 'welcome') {
    return <WelcomeStage data={data} onBegin={() => setStage('wizard')} />;
  }

  // ── Stage 3: Activation sequence ──────────────────────────────────
  if (stage === 'activating') {
    return (
      <ActivationStage
        data={data.activation}
        slug={slug || 'your-slug'}
        methodCount={methods.length}
        bankTail={accountNumber.slice(-4) || '••••'}
        onComplete={finalizeAndRedirect}
      />
    );
  }

  // ── Stage 4: Celebration ──────────────────────────────────────────
  if (stage === 'celebration') {
    return (
      <CelebrationStage
        data={data.activation}
        name={name}
        slug={slug}
        brandColor={brandColor}
        onOpen={() => navigate(`/t/${slug}`)}
        onTest={() => {
          toast.success('Test payment sent to your dashboard');
          navigate(`/t/${slug}`);
        }}
      />
    );
  }

  // ── Stage 2: Wizard ───────────────────────────────────────────────
  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out', maxWidth: '920px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
      </div>

      {/* Progress rail */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {data.steps.map((s: any, i: number) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 12px', borderRadius: radius.pill,
            background: i === step ? colors.card : 'transparent',
            border: `0.5px solid ${i === step ? colors.border : 'transparent'}`,
            boxShadow: i === step ? colors.shadow : 'none',
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: i < step ? colors.teal : i === step ? colors.ink : 'transparent',
              border: i > step ? `0.5px solid ${colors.borderHover}` : 'none',
              color: i <= step ? '#fff' : colors.text3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '9px', fontWeight: 600, fontFamily: typography.family.mono,
            }}>
              {i < step ? <Icons.IconCheck size={9} color="#fff" strokeWidth={2.4} /> : (i + 1)}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: i === step ? colors.ink : colors.text2 }}>{s.short}</span>
          </div>
        ))}
      </div>

      <Card padded style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Kicker style={{ marginBottom: '4px' }}>Step {step + 1} of {data.steps.length}</Kicker>
          <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>{data.steps[step].label}</div>
        </div>

        {/* Step 0: Industry + business basics */}
        {step === 0 && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                What kind of business is this?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                {data.industryPresets.map((p: any) => {
                  const Icon = iconMap[p.icon] || Icons.IconPlus;
                  const selected = presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => pickPreset(p.id)}
                      style={{
                        textAlign: 'left',
                        padding: '14px',
                        background: selected ? colors.bg : colors.card,
                        border: `${selected ? '1.5px' : '0.5px'} solid ${selected ? colors.teal : colors.border}`,
                        borderRadius: radius.md,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <Icon size={18} color={selected ? colors.teal : colors.ink} />
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginTop: '10px', marginBottom: '3px', letterSpacing: '-0.005em' }}>{p.label}</div>
                      <div style={{ fontSize: '10px', color: colors.text2, lineHeight: 1.4 }}>{p.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {preset && (
              <div style={{ padding: '16px 18px', background: colors.tealTint, borderRadius: radius.md, marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Icons.IconSparkle size={12} color={colors.teal} />
                  <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    Nexora pre-configured your {preset.label.split(' · ')[0].toLowerCase()} setup
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {methods.map(m => (
                    <span key={m} style={{ fontSize: '10px', padding: '3px 8px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontFamily: typography.family.mono, color: colors.ink }}>{m}</span>
                  ))}
                  <span style={{ fontSize: '10px', padding: '3px 8px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, color: colors.text2 }}>
                    {cadence.split(' ')[0]} · {plan} plan
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
                  {preset.recommendations[0]}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Legal business name" required>
                <input value={name} onChange={e => { setName(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }} style={inputStyle} placeholder="Razorpay Technologies Pvt. Ltd." />
              </Field>
              <Field label="Workspace slug" helper={`payze.app/t/${slug || 'your-slug'}`} required>
                <input value={slug} onChange={e => setSlug(autoSlug(e.target.value))} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="razorpay" />
              </Field>
              <Field label="Business type">
                <select style={inputStyle} value={businessType} onChange={e => setBusinessType(e.target.value)}>
                  {data.businessTypes.map((t: string) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Website" required>
                <input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://" />
              </Field>
            </div>
          </div>
        )}

        {/* Step 1: Identity / KYC */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="PAN" required>
              <input value={pan} onChange={e => setPan(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="ABCDE1234F" maxLength={10} />
            </Field>
            <Field label="Authorised signatory" required>
              <input value={signatory} onChange={e => setSignatory(e.target.value)} style={inputStyle} placeholder="Full legal name" />
            </Field>
            <div style={{ gridColumn: '1 / -1', padding: '24px', background: colors.bg, borderRadius: radius.md, border: `0.5px dashed ${colors.borderHover}`, textAlign: 'center' }}>
              <Icons.IconDownload size={20} color={colors.text2} />
              <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginTop: '8px', marginBottom: '4px' }}>Drop KYC documents</div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>PAN, Aadhaar, GST certificate · PDF or image · 5 MB max each</div>
              <Button variant="secondary" size="sm" style={{ marginTop: '12px' }} onClick={() => toast.success('3 documents uploaded · verification in background')}>Choose files</Button>
            </div>
            <div style={{ gridColumn: '1 / -1', padding: '14px 16px', background: colors.tealTint, borderRadius: radius.md, fontSize: '12px', color: colors.ink, lineHeight: 1.55, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icons.IconSparkle size={12} color={colors.teal} />
              KYC runs in the background. Your dashboard unlocks before verification completes — live payments turn on once we confirm.
            </div>
          </div>
        )}

        {/* Step 2: Banking + settlement */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Account holder" style={{ gridColumn: '1 / -1' }}>
              <input style={inputStyle} placeholder="As registered with your bank" defaultValue={signatory} />
            </Field>
            <Field label="Account number" required>
              <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="1234567890" />
            </Field>
            <Field label="IFSC code" required>
              <input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="HDFC0000001" maxLength={11} />
            </Field>
            <Field label="Settlement cadence" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {data.settlementCadences.map((c: any) => {
                  const selected = cadence === c.value;
                  return (
                    <button key={c.value} onClick={() => setCadence(c.value)} style={{
                      padding: '12px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      background: selected ? colors.bg : colors.card,
                      border: `${selected ? '1.5px' : '0.5px'} solid ${selected ? colors.teal : colors.border}`,
                      borderRadius: radius.md,
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginBottom: '3px' }}>{c.label}</div>
                      <div style={{ fontSize: '10px', color: colors.text2, fontFamily: typography.family.mono }}>{c.fee}</div>
                    </button>
                  );
                })}
              </div>
            </Field>
            <div style={{ gridColumn: '1 / -1', padding: '14px 16px', background: colors.bg, borderRadius: radius.md, fontSize: '12px', color: colors.text2, lineHeight: 1.55 }}>
              We'll send a ₹1 penny-drop verification to confirm this account. Refunded within 24 hours.
            </div>
          </div>
        )}

        {/* Step 3: Branding */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Field label="Brand color" helper="Used on checkout, receipts, and your public Payze page">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {data.colors.map((c: string) => (
                  <button key={c} onClick={() => setBrandColor(c)} style={{
                    width: '40px', height: '40px', borderRadius: radius.md,
                    background: c, border: brandColor === c ? `2px solid ${colors.ink}` : `0.5px solid ${colors.border}`,
                    cursor: 'pointer', position: 'relative',
                  }}>
                    {brandColor === c && <Icons.IconCheck size={18} color="#fff" strokeWidth={2.5} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Plan">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {data.plans.map((p: any) => {
                  const selected = plan === p.id;
                  return (
                    <button key={p.id} onClick={() => setPlan(p.id as any)} style={{
                      padding: '16px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                      background: selected ? colors.bg : colors.card,
                      border: `${selected ? '1.5px' : '0.5px'} solid ${selected ? colors.teal : colors.border}`,
                      borderRadius: radius.md,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{p.label}</div>
                        <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>{p.price}</div>
                      </div>
                      <div style={{ fontSize: '10px', color: colors.text3, marginBottom: '6px' }}>{p.sub}</div>
                      {p.features.map((f: string) => (
                        <div key={f} style={{ fontSize: '10px', color: colors.text2, display: 'flex', gap: '4px', marginTop: '2px' }}>
                          <span style={{ color: colors.teal }}>·</span>{f}
                        </div>
                      ))}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div style={{ padding: '20px', background: colors.bg, borderRadius: radius.md }}>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Checkout preview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: colors.card, borderRadius: radius.md, border: `0.5px solid ${colors.border}` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
                  {(name || 'P').charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Pay {name || 'your business'}</div>
                  <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono }}>payze.app/t/{slug || 'your-slug'}</div>
                </div>
                <Button variant="primary" size="sm" style={{ background: brandColor }}>Continue</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review + activate */}
        {step === 4 && (
          <div>
            <div style={{ padding: '20px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
              <ReviewRow label="Business" value={preset ? preset.label : '—'} />
              <ReviewRow label="Legal name" value={name || '—'} />
              <ReviewRow label="Workspace" value={`payze.app/t/${slug || 'your-slug'}`} mono />
              <ReviewRow label="PAN" value={pan || '—'} mono />
              <ReviewRow label="Signatory" value={signatory || '—'} />
              <ReviewRow label="Bank" value={accountNumber ? `${ifsc} · ••••${accountNumber.slice(-4)}` : '—'} mono />
              <ReviewRow label="Settlement" value={cadence} />
              <ReviewRow label="Methods" value={methods.join(' · ')} />
              <ReviewRow label="Plan" value={plan} isLast />
            </div>

            {preset && preset.recommendations.length > 1 && (
              <div style={{ padding: '16px 18px', background: colors.tealTint, borderRadius: radius.md, marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.IconSparkle size={11} color={colors.teal} />
                  Nexora suggests once you're live
                </div>
                {preset.recommendations.slice(1).map((r: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '12px', color: colors.ink, lineHeight: 1.55, marginTop: i === 0 ? 0 : '4px' }}>
                    <span style={{ color: colors.teal, flexShrink: 0 }}>·</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.6 }}>
              By activating, this merchant agrees to Payze's <a href="#" style={{ color: colors.ink, textDecoration: 'underline' }}>terms of service</a>, <a href="#" style={{ color: colors.ink, textDecoration: 'underline' }}>privacy policy</a>, and the platform settlement agreement.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</Button>
          {step < data.steps.length - 1 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canContinue()}>Continue →</Button>
          ) : (
            <Button variant="primary" onClick={activate}>
              Activate & run test payment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Welcome stage ────────────────────────────────────────────────────
function WelcomeStage({ data, onBegin }: { data: any; onBegin: () => void }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'payze-fadein 0.6s ease-out',
    }}>
      <div style={{ maxWidth: '620px', textAlign: 'center', padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: radius.lg,
            background: colors.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 30px -10px rgba(26,26,26,0.4)',
          }}>
            <Icons.PayzeMark size={32} color="#F6F6F2" />
          </div>
        </div>

        <Kicker color={colors.teal} style={{ marginBottom: '10px', justifyContent: 'center' }}>{data.welcome.kicker}</Kicker>
        <h1 style={{
          fontSize: '40px', fontWeight: 600, color: colors.ink,
          letterSpacing: '-0.025em', lineHeight: 1.15,
          margin: '0 0 14px 0',
        }}>{data.welcome.title}</h1>
        <div style={{ fontSize: '15px', color: colors.text2, lineHeight: 1.6, marginBottom: '36px' }}>
          {data.welcome.subtitle}
        </div>

        <div style={{
          textAlign: 'left',
          padding: '20px 24px',
          background: colors.card, border: `0.5px solid ${colors.border}`,
          borderRadius: radius.md,
          marginBottom: '30px',
        }}>
          {data.welcome.assurances.map((a: string, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '12px',
              padding: '8px 0',
              borderBottom: i < data.welcome.assurances.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: colors.teal, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '2px',
              }}>
                <Icons.IconCheck size={10} color="#fff" strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: '13px', color: colors.ink, lineHeight: 1.55 }}>{a}</div>
            </div>
          ))}
        </div>

        <Button variant="primary" onClick={onBegin}>
          Begin setup →
        </Button>

        <div style={{ marginTop: '16px', fontSize: '11px', color: colors.text3 }}>
          Takes about 8 minutes · can save and resume anytime
        </div>
      </div>
    </div>
  );
}

// ── Activation stage ─────────────────────────────────────────────────
function ActivationStage({ data, slug, methodCount, bankTail, onComplete }: any) {
  const [currentStep, setCurrentStep] = useState(0);
  const stepsWithSubstitutions = data.steps.map((s: any) => ({
    ...s,
    detail: s.detail
      .replace('{slug}', slug)
      .replace('{methodCount}', String(methodCount))
      .replace('{bankTail}', bankTail),
  }));

  useEffect(() => {
    if (currentStep >= stepsWithSubstitutions.length) {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
    const step = stepsWithSubstitutions[currentStep];
    const t = setTimeout(() => setCurrentStep(c => c + 1), step.durationMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'payze-fadein 0.4s ease-out',
    }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: colors.tealTint, borderRadius: radius.pill, marginBottom: '16px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: '11px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Activating</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em', margin: 0 }}>
            Bringing your workspace online
          </h2>
        </div>

        <Card padded style={{ padding: '24px' }}>
          {stepsWithSubstitutions.map((s: any, i: number) => {
            const done = i < currentStep;
            const active = i === currentStep;
            const pending = i > currentStep;

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '12px 0',
                borderBottom: i < stepsWithSubstitutions.length - 1 ? `0.5px solid ${colors.border}` : 'none',
                opacity: pending ? 0.4 : 1,
                transition: 'opacity 0.3s',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: done ? colors.teal : active ? colors.ink : 'transparent',
                  border: pending ? `0.5px solid ${colors.borderHover}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '1px',
                }}>
                  {done ? (
                    <Icons.IconCheck size={11} color="#fff" strokeWidth={2.5} />
                  ) : active ? (
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%', background: '#fff',
                      animation: 'payze-pulse-dot 1s ease-in-out infinite',
                    }} />
                  ) : null}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: active || done ? 500 : 400, color: colors.ink }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono, marginTop: '2px' }}>{s.detail}</div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── Celebration stage ────────────────────────────────────────────────
function CelebrationStage({ data, name, slug, brandColor, onOpen, onTest }: any) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'payze-fadein 0.6s ease-out',
    }}>
      <div style={{ maxWidth: '540px', width: '100%', textAlign: 'center', padding: '20px' }}>
        {/* Success badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: colors.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 10px ${colors.tealTint}, 0 12px 30px -10px rgba(28,111,107,0.5)`,
            animation: 'payze-fadein 0.6s ease-out 0.1s both',
          }}>
            <Icons.IconCheck size={32} color="#fff" strokeWidth={2.8} />
          </div>
        </div>

        <h1 style={{
          fontSize: '44px', fontWeight: 600, color: colors.ink,
          letterSpacing: '-0.025em', lineHeight: 1.1,
          margin: '0 0 12px 0',
        }}>{data.celebrationTitle}</h1>
        <div style={{ fontSize: '15px', color: colors.text2, lineHeight: 1.6, marginBottom: '32px' }}>
          {data.celebrationSubtitle}
        </div>

        {/* Test payment receipt card */}
        <Card padded style={{ padding: '20px 24px', textAlign: 'left', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: `0.5px solid ${colors.border}` }}>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Test payment</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em' }}>₹100.00 captured</div>
            </div>
            <Pill tone="teal">Succeeded</Pill>
          </div>
          <DetailLine label="Method"    value="UPI · GPay" mono />
          <DetailLine label="Merchant"  value={name || 'Your workspace'} />
          <DetailLine label="Workspace" value={`payze.app/t/${slug}`} mono />
          <DetailLine label="Webhook"   value="payment.succeeded · delivered 178ms" mono isLast />
        </Card>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={onOpen} style={{ background: brandColor }}>
            {data.ctaPrimary}
          </Button>
          <Button variant="secondary" onClick={onTest}>
            {data.ctaSecondary}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Shared atoms ─────────────────────────────────────────────────────
function Field({ label, helper, children, style = {}, required }: any) {
  return (
    <div style={style}>
      <label style={{ display: 'flex', gap: '6px', fontSize: '10px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label} {required && <span style={{ color: colors.teal }}>*</span>}
      </label>
      {children}
      {helper && <div style={{ fontSize: '11px', color: colors.text3, marginTop: '4px' }}>{helper}</div>}
    </div>
  );
}

function ReviewRow({ label, value, mono, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px', gap: '12px' }}>
      <span style={{ color: colors.text3, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '10px', fontWeight: 500 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function DetailLine({ label, value, mono, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text3 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
