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
  | { role: 'copilot'; kind: 'thinking' }
  | { role: 'copilot'; kind: 'answer'; summary: string; data: { label: string; value: string }[]; nextSteps: string[]; links: { label: string; href: string }[] }
  | { role: 'copilot'; kind: 'command'; action: string; confirm: string; doneMessage: string; doneDetail: string; state: 'pending' | 'done' }
  | { role: 'copilot'; kind: 'navigate'; href: string; message: string }
  | { role: 'copilot'; kind: 'fallback'; summary: string; suggestion: string };

export function Copilot({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { data: cfg } = useAsync(() => configService.getCopilot(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const matchIntent = (query: string): Message | null => {
    if (!cfg) return null;
    const q = query.toLowerCase().trim();
    if (!q) return null;

    for (const intent of cfg.intents) {
      for (const trigger of intent.triggers) {
        if (q.includes(trigger.toLowerCase())) {
          if (intent.kind === 'answer' && intent.answer) {
            return { role: 'copilot', kind: 'answer', ...intent.answer };
          }
          if (intent.kind === 'command' && intent.command) {
            return { role: 'copilot', kind: 'command', ...intent.command, state: 'pending' };
          }
          if (intent.kind === 'navigate' && intent.navigate) {
            return { role: 'copilot', kind: 'navigate', ...intent.navigate };
          }
        }
      }
    }
    return { role: 'copilot', kind: 'fallback', summary: cfg.fallback.summary, suggestion: cfg.fallback.suggestion };
  };

  const submit = async (query: string) => {
    if (!query.trim() || submitting) return;
    const userMsg: Message = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg, { role: 'copilot', kind: 'thinking' }]);
    setInput('');
    setSubmitting(true);

    // Simulate thinking latency
    await new Promise(r => setTimeout(r, 650 + Math.random() * 400));

    const response = matchIntent(query);
    setMessages(prev => {
      const next = prev.slice(0, -1); // remove thinking
      if (response) next.push(response);
      return next;
    });
    setSubmitting(false);

    // Handle auto-navigate
    if (response?.kind === 'navigate') {
      setTimeout(() => {
        navigate(response.href);
        onClose();
      }, 600);
    }
  };

  const confirmCommand = (idx: number) => {
    setMessages(prev => prev.map((m, i) => {
      if (i === idx && m.role === 'copilot' && m.kind === 'command') {
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

  if (!cfg) {
    return (
      <div onClick={onClose} style={backdropStyle}>
        <div onClick={e => e.stopPropagation()} style={shellStyle}>
          <div style={{ padding: '40px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={backdropStyle}>
      <div onClick={e => e.stopPropagation()} style={shellStyle}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.IconSparkle size={14} color={colors.teal} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Payze Copilot</div>
            <div style={{ fontSize: '11px', color: colors.text3, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
              Answers questions · runs commands
            </div>
          </div>
          <span style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3, padding: '2px 6px', border: `0.5px solid ${colors.border}`, borderRadius: '4px' }}>ESC</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
          {messages.length === 0 && <EmptyState prompts={cfg.suggestedPrompts} onPick={submit} />}
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} onConfirm={() => confirmCommand(i)} />
          ))}
        </div>

        {/* Composer */}
        <div style={{ borderTop: `0.5px solid ${colors.border}`, padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={cfg.placeholder}
              rows={1}
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: '14px',
                background: 'transparent', color: colors.ink, fontFamily: 'inherit',
                resize: 'none', padding: '6px 0', minHeight: '24px', maxHeight: '120px', lineHeight: 1.5,
              }}
              disabled={submitting}
            />
            <button
              onClick={() => submit(input)}
              disabled={!input.trim() || submitting}
              style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: input.trim() && !submitting ? colors.ink : colors.borderHover,
                color: '#fff', border: 'none', cursor: input.trim() && !submitting ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'background 0.15s',
              }}
              aria-label="Send"
            >
              <Icons.IconArrowRight size={14} color="#fff" />
            </button>
          </div>
          <div style={{ fontSize: '10px', color: colors.text3, marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Prototype · responses are scripted over this workspace's data</span>
            <span style={{ fontFamily: typography.family.mono }}>Enter ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ prompts, onPick }: { prompts: any[]; onPick: (q: string) => void }) {
  return (
    <div style={{ padding: '20px 4px' }}>
      <div style={{ fontSize: '15px', fontWeight: 500, color: colors.ink, marginBottom: '6px' }}>Hi Kavya. What do you need?</div>
      <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '20px', lineHeight: 1.5 }}>
        Ask questions about your payments, settlements, or a specific merchant. Or give a command like "refund txn_00482".
      </div>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>Try one</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {prompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onPick(p.query)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              background: colors.bg, border: `0.5px solid ${colors.border}`,
              borderRadius: radius.sm, textAlign: 'left',
              fontSize: '13px', color: colors.ink, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.teal; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}
          >
            <Icons.IconSparkle size={12} color={colors.text3} />
            <span style={{ flex: 1 }}>{p.label}</span>
            <Icons.IconArrowUpRight size={12} color={colors.text3} />
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
          padding: '10px 14px', borderRadius: '16px 16px 4px 16px',
          maxWidth: '85%', fontSize: '13px', lineHeight: 1.5,
        }}>{message.text}</div>
      </div>
    );
  }

  if (message.kind === 'thinking') {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <CopilotAvatar />
        <div style={{ padding: '10px 14px', background: colors.bg, borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: colors.text2 }}>
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <CopilotAvatar />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: colors.bg, padding: '14px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: colors.ink, lineHeight: 1.55, marginBottom: '8px' }}>
            {message.summary}
          </div>
          {message.data.length > 0 && (
            <div style={{ padding: '12px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, marginBottom: '8px' }}>
              {message.data.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', borderBottom: i < message.data.length - 1 ? `0.5px solid ${colors.border}` : 'none', fontSize: '12px', gap: '12px' }}>
                  <span style={{ color: colors.text3, letterSpacing: '0.04em', flexShrink: 0 }}>{d.label}</span>
                  <span style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.mono, textAlign: 'right' }}>{d.value}</span>
                </div>
              ))}
            </div>
          )}
          {message.nextSteps.length > 0 && (
            <div style={{ padding: '10px 14px', background: colors.tealTint, borderRadius: radius.md, marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>Recommended</div>
              {message.nextSteps.map((s, i) => (
                <div key={i} style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.5, display: 'flex', gap: '8px', paddingTop: i > 0 ? '4px' : 0 }}>
                  <span style={{ color: colors.teal, flexShrink: 0 }}>·</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}
          {message.links.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {message.links.map((l, i) => (
                <a key={i} href={l.href} style={{ fontSize: '11px', color: colors.ink, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill }}>
                  {l.label} <Icons.IconArrowUpRight size={11} />
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <CopilotAvatar />
        <div style={{ flex: 1, padding: '14px 16px', background: done ? colors.tealTint : colors.bg, border: `0.5px solid ${done ? colors.teal : colors.border}`, borderRadius: radius.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: done ? '6px' : '10px' }}>
            <Pill tone={done ? 'teal' : 'neutral'}>{done ? 'Done' : 'Command'}</Pill>
            <span style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono }}>{message.action}</span>
          </div>
          {done ? (
            <>
              <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '4px' }}>{message.doneMessage}</div>
              <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>{message.doneDetail}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '13px', color: colors.ink, marginBottom: '10px', lineHeight: 1.5 }}>{message.confirm}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <CopilotAvatar />
        <div style={{ padding: '10px 14px', background: colors.bg, borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: colors.ink, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {message.message} <Icons.IconArrowUpRight size={12} color={colors.text2} />
        </div>
      </div>
    );
  }

  if (message.kind === 'fallback') {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <CopilotAvatar />
        <div style={{ flex: 1 }}>
          <div style={{ background: colors.bg, padding: '12px 14px', borderRadius: '16px 16px 16px 4px', fontSize: '13px', color: colors.text2, lineHeight: 1.55, marginBottom: '6px' }}>
            {message.summary}
          </div>
          <div style={{ fontSize: '11px', color: colors.text3, paddingLeft: '4px', lineHeight: 1.5 }}>{message.suggestion}</div>
        </div>
      </div>
    );
  }

  return null;
}

function CopilotAvatar() {
  return (
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
      <Icons.IconSparkle size={12} color={colors.teal} />
    </div>
  );
}

function ThinkingDot({ delay }: { delay: number }) {
  return (
    <span style={{
      display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
      background: colors.text2,
      animation: `payze-pulse-dot 1.4s ease-in-out ${delay}s infinite`,
    }} />
  );
}

const backdropStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  paddingTop: '80px', paddingBottom: '40px', zIndex: 100,
};

const shellStyle: React.CSSProperties = {
  width: '640px', maxWidth: '92vw', maxHeight: 'calc(100vh - 120px)',
  background: colors.card, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.lg, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
  overflow: 'hidden', display: 'flex', flexDirection: 'column',
};
