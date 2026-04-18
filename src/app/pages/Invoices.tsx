import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const iconMap: Record<string, any> = {
  IconEye: Icons.IconEye, IconDownload: Icons.IconDownload, IconMail: Icons.IconMail,
  IconCopy: Icons.IconCopy, IconPlus: Icons.IconPlus, IconX: Icons.IconX,
};

export function Invoices() {
  const { data, loading, error, refetch } = useAsync(() => configService.getInvoices(), []);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewing, setViewing] = useState<any>(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  if (error) return <ErrorState message={`Couldn't load invoices — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading invoices" />;

  const { header, stats, rowActions, invoices } = data;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Exporting as CSV')}>Export</Button>
          <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setShowBuilder(true)}>New invoice</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 1fr 0.9fr 0.8fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Number</div><div>Merchant · Customer</div><div>Amount</div><div>Due</div><div>Status</div><div></div>
        </div>
        {invoices.map((inv: any, i: number) => (
          <div key={inv.id} style={{
            display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 1fr 0.9fr 0.8fr 0.4fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < invoices.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px', cursor: 'pointer',
          }} onClick={() => setViewing(inv)}>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{inv.id}</div>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{inv.merchant}</div>
              <div style={{ color: colors.text3, fontSize: '11px' }}>{inv.customer}</div>
            </div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{inv.amount}</div>
            <div style={{ color: colors.text2 }}>{inv.due}</div>
            <div><Pill tone={inv.status === 'Paid' ? 'teal' : inv.status === 'Overdue' ? 'outline' : 'neutral'}>{inv.status}</Pill></div>
            <div style={{ textAlign: 'right', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setActionsFor(actionsFor === inv.id ? null : inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}>
                <Icons.IconSettings size={14} />
              </button>
              {actionsFor === inv.id && (
                <>
                  <div onClick={() => setActionsFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, minWidth: '180px', zIndex: 50, padding: '6px' }}>
                    {rowActions.map((a: any) => {
                      const IconComp = iconMap[a.icon] || Icons.IconSettings;
                      const handler = () => {
                        if (a.kind === 'preview') setViewing(inv);
                        else if (a.kind === 'download') toast.success(`Downloading ${inv.id}.pdf`);
                        else if (a.kind === 'remind') toast.success('Reminder sent');
                        else if (a.kind === 'copy') { navigator.clipboard.writeText(`https://payze.link/${inv.id}`); toast.success('Link copied'); }
                        else if (a.kind === 'dup') toast.success('Invoice duplicated');
                        else if (a.kind === 'cancel') toast.success('Invoice cancelled');
                        setActionsFor(null);
                      };
                      return (
                        <button key={a.label} onClick={handler} style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px',
                          background: 'transparent', border: 'none', borderRadius: radius.sm,
                          fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        }}>
                          <IconComp size={12} color={colors.text2} />
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </Card>

      {showBuilder && <InvoiceBuilder onClose={() => setShowBuilder(false)} />}
      {viewing && <InvoicePreview invoice={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function InvoiceBuilder({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState([{ desc: 'Professional services', qty: 1, price: 50000 }]);
  const [customer, setCustomer] = useState('');
  const [email, setEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '700px', maxWidth: '100%', background: colors.card,
        border: `0.5px solid ${colors.border}`, borderRadius: radius.lg,
        padding: '32px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>New invoice</Kicker>
            <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>Draft and send</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}><Icons.IconX size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <Field label="Customer name"><input style={inputStyle} value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Studio Lumière" /></Field>
          <Field label="Email"><input style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="finance@customer.com" /></Field>
          <Field label="Due date"><input type="date" style={inputStyle} value={dueDate} onChange={e => setDueDate(e.target.value)} /></Field>
          <Field label="Currency"><select style={inputStyle}><option>INR</option><option>USD</option><option>EUR</option></select></Field>
        </div>

        <Kicker style={{ marginBottom: '10px' }}>Line items</Kicker>
        <div style={{ padding: '12px', background: colors.bg, borderRadius: radius.md, marginBottom: '16px' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 0.8fr 0.4fr', gap: '8px', alignItems: 'center', marginBottom: i < items.length - 1 ? '8px' : 0 }}>
              <input style={{ ...inputStyle, fontSize: '12px' }} value={item.desc} onChange={e => {
                const next = [...items]; next[i].desc = e.target.value; setItems(next);
              }} placeholder="Description" />
              <input style={{ ...inputStyle, fontSize: '12px', fontFamily: typography.family.mono }} type="number" value={item.qty} onChange={e => {
                const next = [...items]; next[i].qty = +e.target.value; setItems(next);
              }} />
              <input style={{ ...inputStyle, fontSize: '12px', fontFamily: typography.family.mono }} type="number" value={item.price} onChange={e => {
                const next = [...items]; next[i].price = +e.target.value; setItems(next);
              }} />
              <button onClick={() => setItems(items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}>
                <Icons.IconTrash size={12} />
              </button>
            </div>
          ))}
          <button onClick={() => setItems([...items, { desc: '', qty: 1, price: 0 }])} style={{ background: 'none', border: `0.5px dashed ${colors.borderHover}`, borderRadius: radius.sm, padding: '8px', fontSize: '11px', color: colors.text2, cursor: 'pointer', width: '100%', marginTop: '8px', fontFamily: 'inherit' }}>
            + Add line
          </button>
        </div>

        <Field label="Notes (optional)" style={{ marginBottom: '20px' }}>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, PO number, or a thank you" />
        </Field>

        <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '24px', fontFamily: typography.family.mono, fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: colors.text2 }}>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: colors.text2 }}>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0 0', borderTop: `0.5px solid ${colors.ink}`, marginTop: '6px', fontWeight: 600 }}>
            <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => { toast.success('Saved as draft'); onClose(); }}>Save draft</Button>
          <Button variant="primary" icon={<Icons.IconSend size={14} />} onClick={() => { toast.success('Invoice sent'); onClose(); }}>Send invoice</Button>
        </div>
      </div>
    </div>
  );
}

function InvoicePreview({ invoice, onClose }: { invoice: any; onClose: () => void }) {
  const subtotal = invoice.items.reduce((sum: number, i: any) => sum + i.qty * i.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '620px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Invoice preview</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{invoice.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}><Icons.IconX size={18} /></button>
        </div>

        <div style={{ padding: '28px', background: colors.bg, borderRadius: radius.lg, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px' }}>Invoice</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{invoice.id}</div>
            </div>
            <Pill tone={invoice.status === 'Paid' ? 'teal' : invoice.status === 'Overdue' ? 'outline' : 'neutral'}>{invoice.status}</Pill>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>From</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{invoice.merchant}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Bill to</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{invoice.customer}</div>
              <div style={{ fontSize: '11px', color: colors.text2 }}>{invoice.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Issued</div>
              <div style={{ fontSize: '12px', color: colors.ink }}>{invoice.issued}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Due</div>
              <div style={{ fontSize: '12px', color: colors.ink }}>{invoice.due}</div>
            </div>
          </div>

          <div style={{ borderTop: `0.5px solid ${colors.ink}`, paddingTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr', gap: '12px', fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <div>Description</div><div style={{ textAlign: 'right' }}>Qty</div><div style={{ textAlign: 'right' }}>Amount</div>
            </div>
            {invoice.items.map((item: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr', gap: '12px', padding: '10px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '13px' }}>
                <div style={{ color: colors.ink }}>{item.desc}</div>
                <div style={{ textAlign: 'right', color: colors.text2, fontFamily: typography.family.mono }}>{item.qty}</div>
                <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', fontFamily: typography.family.mono, fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: colors.text2 }}>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span style={{ color: colors.text2 }}>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0 0', borderTop: `0.5px solid ${colors.ink}`, marginTop: '6px', fontSize: '16px', fontWeight: 600 }}>
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success(`${invoice.id}.pdf downloaded`)}>Download PDF</Button>
          <Button variant="secondary" icon={<Icons.IconMail size={14} />} onClick={() => toast.success('Sent to customer')}>Send</Button>
          <Button variant="ghost" icon={<Icons.IconCopy size={14} />} onClick={() => { navigator.clipboard.writeText(`https://payze.link/${invoice.id}`); toast.success('Pay link copied'); }}>Copy link</Button>
        </div>
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
  width: '100%', padding: '10px 14px', background: colors.card, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
