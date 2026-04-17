import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { bookingService } from '../../services';
import { toast } from 'sonner';

export function BookDemo() {
  const [step, setStep] = useState<'pick' | 'form' | 'confirmed'>('pick');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', interest: '' });
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const slots = useMemo(() => {
    const out: { date: string; label: string; day: string; slots: string[] }[] = [];
    const now = new Date();
    let added = 0;
    let offset = 1;
    while (added < 14) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      offset++;
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      out.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        slots: ['10:00', '11:30', '14:00', '15:30', '17:00'],
      });
      added++;
    }
    return out;
  }, []);

  const handleSubmit = async () => {
    if (!selectedSlot || !form.name || !form.email) return;
    setSubmitting(true);
    try {
      const booking = await bookingService.create({
        name: form.name, email: form.email, company: form.company,
        interest: form.interest, slot: selectedSlot,
      });
      setConfirmedBooking(booking);
      setStep('confirmed');
      toast.success('Demo booked');
    } catch {
      toast.error('Failed to book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)', backgroundSize: '26px 26px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1080px', margin: '0 auto', padding: '24px 40px' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '56px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.PayzeMark size={22} />
            <span style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>Payze</span>
          </Link>
          <Link to="/" style={{ fontSize: '13px', color: colors.text2 }}>← Back to home</Link>
        </nav>

        {step !== 'confirmed' && (
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
              <Kicker color={colors.teal} style={{ marginBottom: '10px' }}>Book a demo</Kicker>
              <div style={{ fontSize: '48px', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: '12px' }}>
                See Payze in action.
              </div>
              <div style={{ fontSize: '16px', color: colors.text2, maxWidth: '480px', margin: '0 auto' }}>
                30 minutes with our team. We'll show you routing, fallbacks, and live analytics on your data.
              </div>
            </div>

            {step === 'pick' && (
              <Card padded style={{ padding: '32px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '20px' }}>Pick a time</div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
                  {slots.map(d => (
                    <div key={d.date} style={{ flexShrink: 0, width: '96px', textAlign: 'center', padding: '12px 8px', background: colors.bg, borderRadius: radius.md }}>
                      <div style={{ fontSize: '10px', color: colors.text3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{d.label.split(' ')[0]}</div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginTop: '4px' }}>{d.label.split(' ')[1]}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                  {slots[0].slots.flatMap((time) =>
                    slots.slice(0, 3).map(d => {
                      const slot = `${d.date} ${time}`;
                      return (
                        <button key={slot} onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                          style={{
                            padding: '12px', background: colors.card,
                            border: `0.5px solid ${colors.border}`, borderRadius: radius.sm,
                            fontSize: '13px', color: colors.ink, cursor: 'pointer',
                            fontFamily: 'inherit', fontWeight: 500,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.teal; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                        >
                          {d.day} · {time}
                        </button>
                      );
                    })
                  )}
                </div>
              </Card>
            )}

            {step === 'form' && (
              <Card padded style={{ padding: '32px' }}>
                <div style={{ fontSize: '11px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => setStep('pick')}>← Change time</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginBottom: '4px' }}>Your call is on {selectedSlot}</div>
                <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '24px' }}>Tell us about yourself so we can prepare.</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <Field label="Your name">
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Work email">
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="Company" style={{ gridColumn: '1 / -1' }}>
                    <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={inputStyle} />
                  </Field>
                  <Field label="What are you trying to solve?" style={{ gridColumn: '1 / -1' }}>
                    <textarea value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional" />
                  </Field>
                </div>

                <Button variant="primary" onClick={handleSubmit} disabled={submitting || !form.name || !form.email} fullWidth>
                  {submitting ? 'Booking…' : `Confirm ${selectedSlot}`}
                </Button>
              </Card>
            )}
          </div>
        )}

        {step === 'confirmed' && confirmedBooking && (
          <div style={{ maxWidth: '620px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: colors.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Icons.IconCheck size={28} color={colors.teal} strokeWidth={2} />
              </div>
              <div style={{ fontSize: '36px', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                You're booked.
              </div>
              <div style={{ fontSize: '15px', color: colors.text2 }}>We'll see you on {confirmedBooking.slot}.</div>
            </div>

            <Card padded style={{ padding: '24px', marginBottom: '20px' }}>
              <Kicker style={{ marginBottom: '12px' }}>Calendar invite sent</Kicker>
              <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.7, fontFamily: typography.family.mono }}>
                <div><span style={{ color: colors.text3 }}>To:</span> {confirmedBooking.email}</div>
                <div><span style={{ color: colors.text3 }}>When:</span> {confirmedBooking.slot} IST</div>
                <div><span style={{ color: colors.text3 }}>Duration:</span> 30 minutes</div>
                <div><span style={{ color: colors.text3 }}>Zoom:</span> https://payze.zoom.us/j/{Math.floor(Math.random() * 1000000000)}</div>
                <div><span style={{ color: colors.text3 }}>Meeting ID:</span> 824 {Math.floor(Math.random() * 1000)} {Math.floor(Math.random() * 1000)}</div>
              </div>
            </Card>

            <div style={{ textAlign: 'center' }}>
              <Link to="/"><Button variant="ghost">Back to home</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, style = {} }: any) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px',
  outline: 'none', color: colors.ink,
  fontFamily: 'inherit',
};
