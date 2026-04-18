import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { bookingService } from '../../services';
import { toast } from 'sonner';

type Slot = { date: string; label: string; dayShort: string; dayNum: string; month: string; weekday: string };

export function BookDemo() {
  const [step, setStep] = useState<'pick' | 'form' | 'confirmed'>('pick');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', interest: '' });
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Memoize Meet ID & dial-in so the values don't change on every render
  const meeting = useMemo(() => {
    const a = Math.random().toString(36).substring(2, 5);
    const b = Math.random().toString(36).substring(2, 6);
    const c = Math.random().toString(36).substring(2, 5);
    const pin = Math.floor(100000 + Math.random() * 900000);
    return {
      meetCode: `${a}-${b}-${c}`,
      meetUrl: `https://meet.google.com/${a}-${b}-${c}`,
      phone: `+91 80 6199 ${Math.floor(1000 + Math.random() * 9000)}`,
      pin,
    };
  }, []);

  const dates: Slot[] = useMemo(() => {
    const out: Slot[] = [];
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
        dayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: String(d.getDate()),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
      });
      added++;
    }
    return out;
  }, []);

  const times = ['10:00', '11:30', '14:00', '15:30', '17:00'];

  // Default to first available date
  React.useEffect(() => {
    if (!selectedDate && dates.length > 0) setSelectedDate(dates[0].date);
  }, [dates, selectedDate]);

  const selectedDateObj = dates.find(d => d.date === selectedDate);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !form.name || !form.email) return;
    setSubmitting(true);
    try {
      const slot = `${selectedDateObj?.weekday}, ${selectedDateObj?.month} ${selectedDateObj?.dayNum} at ${selectedTime}`;
      const booking = await bookingService.create({
        name: form.name, email: form.email, company: form.company,
        interest: form.interest, slot,
      });
      setConfirmedBooking({ ...booking, dateObj: selectedDateObj, time: selectedTime });
      setStep('confirmed');
      toast.success('Demo booked — calendar invite sent');
    } catch {
      toast.error('Failed to book');
    } finally {
      setSubmitting(false);
    }
  };

  const addToCalendar = (provider: 'google' | 'outlook' | 'apple') => {
    if (!confirmedBooking?.dateObj) return;
    const dt = new Date(`${confirmedBooking.dateObj.date}T${confirmedBooking.time}:00+05:30`);
    const dtEnd = new Date(dt.getTime() + 30 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = 'Payze demo · with our team';
    const details = `30-minute demo · Google Meet\n\nJoin: ${meeting.meetUrl}\nMeet code: ${meeting.meetCode}\nDial-in: ${meeting.phone} · PIN ${meeting.pin}`;

    if (provider === 'google') {
      const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(title)}&dates=${fmt(dt)}/${fmt(dtEnd)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(meeting.meetUrl)}`;
      window.open(url, '_blank');
    } else {
      toast.success(`${provider === 'outlook' ? 'Outlook' : 'Apple Calendar'} .ics generated`);
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
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Pick a date</div>
                  <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                    All times IST
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
                  {dates.map(d => {
                    const isSelected = d.date === selectedDate;
                    return (
                      <button
                        key={d.date}
                        onClick={() => { setSelectedDate(d.date); setSelectedTime(null); }}
                        style={{
                          flexShrink: 0, width: '82px',
                          textAlign: 'center', padding: '12px 8px',
                          background: isSelected ? colors.ink : colors.bg,
                          color: isSelected ? '#fff' : colors.ink,
                          border: `0.5px solid ${isSelected ? colors.ink : colors.border}`,
                          borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.7)' : colors.text3, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{d.dayShort}</div>
                        <div style={{ fontSize: '22px', fontWeight: 600, marginTop: '4px' }}>{d.dayNum}</div>
                        <div style={{ fontSize: '10px', color: isSelected ? 'rgba(255,255,255,0.7)' : colors.text3, fontFamily: typography.family.mono, marginTop: '2px' }}>{d.month}</div>
                      </button>
                    );
                  })}
                </div>

                {selectedDateObj && (
                  <>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '12px' }}>
                      Available on {selectedDateObj.weekday}, {selectedDateObj.month} {selectedDateObj.dayNum}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {times.map(time => (
                        <button
                          key={time}
                          onClick={() => { setSelectedTime(time); }}
                          style={{
                            padding: '14px 12px',
                            background: selectedTime === time ? colors.teal : colors.card,
                            color: selectedTime === time ? '#fff' : colors.ink,
                            border: `0.5px solid ${selectedTime === time ? colors.teal : colors.border}`,
                            borderRadius: radius.sm,
                            fontSize: '14px', fontWeight: 500,
                            cursor: 'pointer', fontFamily: typography.family.mono,
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={(e) => { if (selectedTime !== time) e.currentTarget.style.borderColor = colors.teal; }}
                          onMouseLeave={(e) => { if (selectedTime !== time) e.currentTarget.style.borderColor = colors.border; }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    {selectedTime && (
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: colors.text2 }}>
                          <span style={{ color: colors.ink, fontWeight: 600 }}>{selectedDateObj.weekday}, {selectedDateObj.month} {selectedDateObj.dayNum}</span> at <span style={{ color: colors.ink, fontWeight: 600 }}>{selectedTime} IST</span>
                        </div>
                        <Button variant="primary" onClick={() => setStep('form')}>Continue →</Button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )}

            {step === 'form' && selectedDateObj && selectedTime && (
              <Card padded style={{ padding: '32px' }}>
                <div style={{ fontSize: '11px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>
                  <span style={{ cursor: 'pointer' }} onClick={() => setStep('pick')}>← Change time</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginBottom: '4px' }}>
                  Your call is on {selectedDateObj.weekday}, {selectedDateObj.month} {selectedDateObj.dayNum} at {selectedTime} IST
                </div>
                <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '24px' }}>Tell us about yourself so we can prepare.</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <Field label="Your name"><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /></Field>
                  <Field label="Work email"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} /></Field>
                  <Field label="Company" style={{ gridColumn: '1 / -1' }}><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={inputStyle} /></Field>
                  <Field label="What are you trying to solve?" style={{ gridColumn: '1 / -1' }}>
                    <textarea value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional" />
                  </Field>
                </div>

                <Button variant="primary" onClick={handleSubmit} disabled={submitting || !form.name || !form.email} fullWidth>
                  {submitting ? 'Booking…' : 'Confirm & send invite'}
                </Button>
              </Card>
            )}
          </div>
        )}

        {step === 'confirmed' && confirmedBooking && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: colors.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Icons.IconCheck size={28} color={colors.teal} strokeWidth={2} />
              </div>
              <div style={{ fontSize: '36px', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                You're booked.
              </div>
              <div style={{ fontSize: '15px', color: colors.text2 }}>
                Calendar invite sent to {confirmedBooking.email}
              </div>
            </div>

            {/* Google Meet invite card */}
            <Card padded={false} style={{ marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <GoogleMeetMark />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Google Meet</div>
                  <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono }}>{meeting.meetCode}</div>
                </div>
                <Button variant="primary" size="sm" onClick={() => window.open(meeting.meetUrl, '_blank')}>Join meeting</Button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '14px 20px', fontSize: '13px', alignItems: 'start' }}>
                <IconLabel icon={<Icons.IconUser size={14} color={colors.text2} />} />
                <div>
                  <div style={{ color: colors.ink, fontWeight: 500 }}>{confirmedBooking.name}</div>
                  <div style={{ fontSize: '11px', color: colors.text3 }}>{confirmedBooking.email}</div>
                </div>

                <IconLabel icon={<Icons.IconCalendar size={14} color={colors.text2} />} />
                <div>
                  <div style={{ color: colors.ink, fontWeight: 500 }}>
                    {confirmedBooking.dateObj.weekday}, {confirmedBooking.dateObj.month} {confirmedBooking.dateObj.dayNum}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text2, fontFamily: typography.family.mono }}>
                    {confirmedBooking.time}–{addMinutes(confirmedBooking.time, 30)} IST · 30 minutes
                  </div>
                </div>

                <IconLabel icon={<Icons.IconLink size={14} color={colors.text2} />} />
                <div>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '12px', color: colors.ink, wordBreak: 'break-all' }}>
                    {meeting.meetUrl}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text3, marginTop: '4px' }}>
                    Or dial in: {meeting.phone} · PIN <span style={{ fontFamily: typography.family.mono }}>{meeting.pin}#</span>
                  </div>
                </div>

                {confirmedBooking.company && (
                  <>
                    <IconLabel icon={<Icons.IconTenants size={14} color={colors.text2} />} />
                    <div style={{ color: colors.ink, fontWeight: 500 }}>{confirmedBooking.company}</div>
                  </>
                )}

                {confirmedBooking.interest && (
                  <>
                    <IconLabel icon={<Icons.IconChart size={14} color={colors.text2} />} />
                    <div style={{ color: colors.text2, fontSize: '12px', lineHeight: 1.5 }}>{confirmedBooking.interest}</div>
                  </>
                )}
              </div>

              <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, background: colors.bg, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm" onClick={() => addToCalendar('google')} icon={<GoogleCalendarMark size={12} />}>
                  Add to Google Calendar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => addToCalendar('outlook')}>Outlook</Button>
                <Button variant="ghost" size="sm" onClick={() => addToCalendar('apple')}>Apple Calendar</Button>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(meeting.meetUrl); toast.success('Meet link copied'); }} icon={<Icons.IconCopy size={12} />}>
                  Copy link
                </Button>
              </div>
            </Card>

            <div style={{ fontSize: '12px', color: colors.text3, textAlign: 'center', lineHeight: 1.6 }}>
              Need to reschedule? Reply to the invite email or write to{' '}
              <a href="mailto:hello@payze.com" style={{ color: colors.ink, textDecoration: 'underline' }}>hello@payze.com</a>.
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link to="/"><Button variant="ghost">Back to home</Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function IconLabel({ icon }: { icon: React.ReactNode }) {
  return <div style={{ width: '14px', height: '14px', marginTop: '2px' }}>{icon}</div>;
}

function GoogleMeetMark() {
  return (
    <svg width="36" height="32" viewBox="0 0 36 32" aria-hidden>
      <rect x="4" y="4" width="20" height="24" rx="3" fill="#00897B" />
      <path d="M 24 12 L 32 8 L 32 24 L 24 20 Z" fill="#00897B" />
      <path d="M 4 4 L 4 28 L 16 28 L 16 4 Z" fill="#1A73E8" opacity="0.9" />
      <path d="M 16 4 L 16 28 L 24 28 L 24 4 Z" fill="#FBBC04" opacity="0.9" />
      <rect x="4" y="4" width="20" height="24" rx="3" fill="none" stroke="#00897B" strokeWidth="0" />
      <path d="M 24 12 L 32 8 L 32 24 L 24 20 Z" fill="#EA4335" opacity="0.9" />
    </svg>
  );
}

function GoogleCalendarMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#4285F4" strokeWidth="1.5" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="#4285F4" strokeWidth="1.5" />
      <text x="12" y="18" fontFamily="Inter" fontSize="8" fontWeight="700" fill="#4285F4" textAnchor="middle">31</text>
    </svg>
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
  outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
