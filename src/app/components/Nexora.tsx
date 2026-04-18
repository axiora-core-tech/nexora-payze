import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

type Message =
  | { role: 'user'; text: string }
  | { role: 'nexora'; kind: 'thinking' }
  | { role: 'nexora'; kind: 'answer'; summary: string; data: { label: string; value: string }[]; nextSteps: string[]; links: { label: string; href: string }[] }
  | { role: 'nexora'; kind: 'command'; action: string; confirm: string; doneMessage: string; doneDetail: string; state: 'pending' | 'done' }
  | { role: 'nexora'; kind: 'navigate'; href: string; message: string }
  | { role: 'nexora'; kind: 'fallback'; summary: string; suggestion: string };

type NexoraProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function Nexora({ open, onOpen, onClose }: NexoraProps) {
  const navigate = useNavigate();
  const { data: cfg } = useAsync(() => configService.getCopilot(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (open) {
      // Small delay to let the panel finish appearing
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const matchIntent = (query: string): Message | null => {
    if (!cfg) return null;
    const q = query.toLowerCase().trim();
    if (!q) return null;

    for (const intent of cfg.intents) {
      for (const trigger of intent.triggers) {
        if (q.includes(trigger.toLowerCase())) {
          if (intent.kind === 'answer' && intent.answer) {
            return { role: 'nexora', kind: 'answer', ...intent.answer };
          }
          if (intent.kind === 'command' && intent.command) {
            return { role: 'nexora', kind: 'command', ...intent.command, state: 'pending' };
          }
          if (intent.kind === 'navigate' && intent.navigate) {
            return { role: 'nexora', kind: 'navigate', ...intent.navigate };
          }
        }
      }
    }
    return { role: 'nexora', kind: 'fallback', summary: cfg.fallback.summary, suggestion: cfg.fallback.suggestion };
  };

  const submit = async (query: string) => {
    if (!query.trim() || submitting) return;
    const userMsg: Message = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg, { role: 'nexora', kind: 'thinking' }]);
    setInput('');
    setSubmitting(true);

    await new Promise(r => setTimeout(r, 650 + Math.random() * 400));

    const response = matchIntent(query);
    setMessages(prev => {
      const next = prev.slice(0, -1);
      if (response) next.push(response);
      return next;
    });
    setSubmitting(false);

    if (response?.kind === 'navigate') {
      setTimeout(() => {
        navigate(response.href);
      }, 600);
    }
  };

  const confirmCommand = (idx: number) => {
    setMessages(prev => prev.map((m, i) => {
      if (i === idx && m.role === 'nexora' && m.kind === 'command') {
        toast.success(m.doneMessage);
        return { ...m, state: 'done' };
      }
      return m;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  };

  return (
    <>
      {/* Floating launcher (visible when panel is closed) */}
      {!open && (
        <button
          onClick={onOpen}
          aria-label="Open Nexora"
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '52px', // Above the 32px ticker
            zIndex: 50,
            width: '52px',
            height: '52px',
            borderRadius: '26px',
            background: colors.ink,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px -8px rgba(26,26,26,0.4), 0 2px 6px rgba(26,26,26,0.12)',
            animation: 'payze-fadein 0.4s ease-out',
            transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 36px -6px rgba(26,26,26,0.5), 0 4px 10px rgba(26,26,26,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px -8px rgba(26,26,26,0.4), 0 2px 6px rgba(26,26,26,0.12)';
          }}
        >
          <Icons.IconSparkle size={20} color={colors.teal} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: colors.teal,
            border: `2px solid ${colors.ink}`,
            animation: 'payze-pulse-dot 2s ease-in-out infinite',
          }} />
        </button>
      )}

      {/* Floating chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Nexora assistant"
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '44px', // 32px ticker + 12px gap
            zIndex: 50,
            width: '420px',
            maxWidth: 'calc(100vw - 40px)',
            height: 'min(620px, calc(100vh - 100px))',
            background: colors.card,
            border: `0.5px solid ${colors.border}`,
            borderRadius: radius.lg,
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3), 0 8px 24px -8px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'nexora-slide-up 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.IconSparkle size={14} color={colors.teal} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.005em' }}>Nexora</div>
              <div style={{ fontSize: '10px', color: colors.text3, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
                Answers questions · runs commands
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Minimize Nexora"
              title="Minimize (⌘K to reopen)"
              style={{
                width: '24px', height: '24px', borderRadius: radius.sm,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: colors.text2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = colors.bg; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Icons.IconX size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
            {messages.length === 0 && <EmptyState prompts={cfg?.suggestedPrompts || []} onPick={submit} />}
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} onConfirm={() => confirmCommand(i)} />
            ))}
          </div>

          {/* Composer */}
          <div style={{ borderTop: `0.5px solid ${colors.border}`, padding: '12px 18px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={cfg?.placeholder || 'Ask Nexora anything…'}
                rows={1}
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: '13px',
                  background: 'transparent', color: colors.ink, fontFamily: 'inherit',
                  resize: 'none', padding: '6px 0', minHeight: '22px', maxHeight: '100px', lineHeight: 1.5,
                }}
                disabled={submitting}
              />
              <button
                onClick={() => submit(input)}
                disabled={!input.trim() || submitting}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: input.trim() && !submitting ? colors.ink : colors.borderHover,
                  color: '#fff', border: 'none', cursor: input.trim() && !submitting ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                aria-label="Send"
              >
                <Icons.IconArrowRight size={12} color="#fff" />
              </button>
            </div>
            <div style={{ fontSize: '10px', color: colors.text3, marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Prototype · scripted over this workspace's data</span>
              <span style={{ fontFamily: typography.family.mono }}>⌘K · ESC</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState({ prompts, onPick }: { prompts: any[]; onPick: (q: string) => void }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ fontSize: '14px', fontWeight: 500, color: colors.ink, marginBottom: '4px' }}>Hi Kavya. What do you need?</div>
      <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '18px', lineHeight: 1.5 }}>
        Ask questions about your payments, settlements, or a specific merchant. Or give a command like "refund txn_00482".
      </div>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Try one</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPick(p.query)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 11px',
              background: colors.bg, border: `0.5px solid ${colors.border}`,
              borderRadius: radius.sm, textAlign: 'left',
              fontSize: '12px', color: colors.ink, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.teal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}
          >
            <Icons.IconSparkle size={11} color={colors.text3} />
            <span style={{ flex: 1 }}>{p.label}</span>
            <Icons.IconArrowUpRight size={11} color={colors.text3} />
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, onConfirm }: { message: Message; onConfirm: () => void }) {
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          background: colors.ink, color: '#fff',
          padding: '9px 13px', borderRadius: '14px 14px 4px 14px',
          maxWidth: '88%', fontSize: '13px', lineHeight: 1.5,
        }}>{message.text}</div>
      </div>
    );
  }

  if (message.kind === 'thinking') {
    return (
      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <NexoraAvatar />
        <div style={{ padding: '9px 13px', background: colors.bg, borderRadius: '14px 14px 14px 4px', fontSize: '13px', color: colors.text2 }}>
          <span style={{ display: 'inline-flex', gap: '4px' }}>
            <ThinkingDot delay={0} />
            <ThinkingDot delay={0.2} />
            <ThinkingDot delay={0.4} />
          </span>
        </div>
      </div>
    );
  }

  if (message.kind === 'answer') {
    return (
      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <NexoraAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: colors.bg, padding: '10px 13px', borderRadius: '14px 14px 14px 4px', fontSize: '13px', color: colors.ink, lineHeight: 1.55, marginBottom: '8px' }}>
            {message.summary}
          </div>
          {message.data.length > 0 && (
            <div style={{ padding: '10px 13px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, marginBottom: '8px' }}>
              {message.data.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: i < message.data.length - 1 ? `0.5px solid ${colors.border}` : 'none', fontSize: '11px', gap: '10px' }}>
                  <span style={{ color: colors.text3, flexShrink: 0 }}>{d.label}</span>
                  <span style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.mono, textAlign: 'right' }}>{d.value}</span>
                </div>
              ))}
            </div>
          )}
          {message.nextSteps.length > 0 && (
            <div style={{ padding: '9px 12px', background: colors.tealTint, borderRadius: radius.md, marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '5px' }}>Recommended</div>
              {message.nextSteps.map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.5, display: 'flex', gap: '6px', paddingTop: i > 0 ? '3px' : 0 }}>
                  <span style={{ color: colors.teal, flexShrink: 0 }}>·</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
          {message.links.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {message.links.map((l, i) => (
                <a key={i} href={l.href} style={{ fontSize: '11px', color: colors.ink, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 9px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill }}>
                  {l.label} <Icons.IconArrowUpRight size={10} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.kind === 'command') {
    const done = message.state === 'done';
    return (
      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <NexoraAvatar />
        <div style={{ flex: 1, padding: '11px 13px', background: done ? colors.tealTint : colors.bg, border: `0.5px solid ${done ? colors.teal : colors.border}`, borderRadius: radius.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: done ? '5px' : '8px' }}>
            <Pill tone={done ? 'teal' : 'neutral'}>{done ? 'Done' : 'Command'}</Pill>
            <span style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{message.action}</span>
          </div>
          {done ? (
            <>
              <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500, marginBottom: '3px' }}>{message.doneMessage}</div>
              <div style={{ fontSize: '10px', color: colors.text2, fontFamily: typography.family.mono }}>{message.doneDetail}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '12px', color: colors.ink, marginBottom: '9px', lineHeight: 1.5 }}>{message.confirm}</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <Button variant="primary" size="sm" onClick={onConfirm}>Confirm</Button>
                <Button variant="ghost" size="sm" onClick={onConfirm}>Cancel</Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (message.kind === 'navigate') {
    return (
      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <NexoraAvatar />
        <div style={{ padding: '9px 13px', background: colors.bg, borderRadius: '14px 14px 14px 4px', fontSize: '13px', color: colors.ink, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {message.message} <Icons.IconArrowUpRight size={11} color={colors.text2} />
        </div>
      </div>
    );
  }

  if (message.kind === 'fallback') {
    return (
      <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
        <NexoraAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: colors.bg, padding: '10px 13px', borderRadius: '14px 14px 14px 4px', fontSize: '13px', color: colors.text2, lineHeight: 1.55, marginBottom: '5px' }}>
            {message.summary}
          </div>
          <div style={{ fontSize: '11px', color: colors.text3, paddingLeft: '4px', lineHeight: 1.5 }}>{message.suggestion}</div>
        </div>
      </div>
    );
  }

  return null;
}

function NexoraAvatar() {
  return (
    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
      <Icons.IconSparkle size={11} color={colors.teal} />
    </div>
  );
}

function ThinkingDot({ delay }: { delay: number }) {
  return (
    <span style={{
      display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%',
      background: colors.text2,
      animation: `payze-pulse-dot 1.4s ease-in-out ${delay}s infinite`,
    }} />
  );
}
