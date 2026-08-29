import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '../types';
import { TrustStrip } from './trust/TrustStrip';

export const AICopilot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'I can analyze this synthetic close, explain variances, and prepare executive summaries. Financial facts are grounded in the deterministic finance layer; model output never grants action authority.'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    'Why did EBITDA fall this month?',
    'Which close exceptions need controller review?',
    'Generate a board summary.',
    'Forecast Q3 revenue based on the current trend.'
  ];

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isSending]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isSending) return;
    const userMsg: ChatMessage = { id: `m-user-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsSending(true);

    try {
      const conversationHistory = [...messages, userMsg].slice(-8).map(({ role, content }) => ({ role, content }));
      const res = await fetch('/api/copilot/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: `m-bot-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'No answer was produced.',
        trust: data.trust,
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `m-bot-err-${Date.now()}`,
        role: 'assistant',
        content: `The read-only copilot could not complete that request. ${err?.message || 'Unknown network error.'}`,
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="page-shell copilot-page animate-fade-in">
      <section className="page-heading copilot-heading">
        <div>
          <span className="eyebrow">05 — GOVERNED AI COPILOT</span>
          <h1>Ask finance questions without surrendering control.</h1>
          <p>Every answer is paired with evidence quality, source agreement, unresolved exceptions and a separate action-authority state.</p>
        </div>
        <div className="read-only-pill"><ShieldCheck className="w-4 h-4" /> Read-only model boundary</div>
      </section>

      <section className="copilot-layout">
        <div className="copilot-main panel-card">
          <div className="messages-list">
            {messages.map((msg) => {
              const bot = msg.role === 'assistant';
              return (
                <div key={msg.id} className={`message-row ${bot ? 'bot' : 'user'}`}>
                  <div className="message-avatar">{bot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}</div>
                  <div className="message-stack">
                    <div className="message-bubble"><p>{msg.content}</p></div>
                    {msg.trust && <TrustStrip trust={msg.trust} />}
                  </div>
                </div>
              );
            })}
            {isSending && (
              <div className="message-row bot"><div className="message-avatar"><Loader2 className="w-4 h-4 animate-spin" /></div><div className="message-bubble loading">Evaluating evidence and generating read-only analysis…</div></div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="copilot-composer">
            <div className="suggestion-row">
              {suggestions.map((s) => <button key={s} disabled={isSending} onClick={() => handleSend(s)}><Sparkles className="w-3 h-3" />{s}</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}>
              <input value={inputVal} onChange={(e) => setInputVal(e.target.value)} maxLength={2500} placeholder="Ask about the close, evidence, variances, cash or a board narrative…" />
              <button type="submit" disabled={!inputVal.trim() || isSending}><Send className="w-4 h-4" /> Ask</button>
            </form>
          </div>
        </div>

        <aside className="copilot-side">
          <div className="panel-card context-card">
            <span className="eyebrow">TRUST CONTEXT</span><h3>What the model can see</h3>
            <div className="context-stat"><span>Financial records</span><b>12 months</b></div>
            <div className="context-stat"><span>Connected sources</span><b>5 synthetic</b></div>
            <div className="context-stat"><span>Open exceptions</span><b className="warn">2</b></div>
            <div className="context-stat"><span>Tool execution</span><b>None</b></div>
          </div>
          <div className="panel-card context-card">
            <span className="eyebrow">MODEL AUTHORITY</span><h3>Explicitly constrained</h3>
            <ul className="control-list">
              <li>Cannot mutate finance records</li><li>Cannot approve reconciliation</li><li>Cannot send payments</li><li>Cannot publish a board pack</li><li>Cannot treat document instructions as authority</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};
