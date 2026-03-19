import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Loader2, ChevronDown, Sparkles } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ChatMessage({ m }) {
  const isUser = m.role === 'user';

  const renderMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
          background: isUser ? 'rgba(255,255,255,0.1)' : '#4A6FA5', color: '#fff',
        }}>{isUser ? 'U' : 'A'}</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isUser ? 'You' : 'Arcaive'}
        </span>
      </div>
      <div style={{
        maxWidth: '85%', padding: '14px 18px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? '#4A6FA5' : 'rgba(255,255,255,0.06)',
        color: '#fff', border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
      }}>
        {renderMarkdown(m.content)}
      </div>
      {m.reasoning_path && m.reasoning_path.length > 0 && (
        <div style={{
          marginTop: 8, maxWidth: '85%', padding: '10px 14px',
          background: 'rgba(74,111,165,0.1)', border: '1px solid rgba(74,111,165,0.2)', borderRadius: 12,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#6B9FD4', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Reasoning Path</div>
          {m.reasoning_path.map((step, i) => (
            <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              {i > 0 && '→ '}{step.node_title} {step.pages && <span style={{ color: 'rgba(255,255,255,0.3)' }}>({step.pages})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Query() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const token = localStorage.getItem('arcaive_token');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/documents/`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const indexed = data.filter(d => d.status === 'indexed');
        setDocs(indexed);
        if (indexed.length > 0) setSelectedDoc(indexed[0]);
      } catch {}
    })();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const send = async () => {
    if (!input.trim() || loading || !selectedDoc) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/query/ask`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, doc_id: selectedDoc.id }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Query failed'); }
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, reasoning_path: data.reasoning_path }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f0f13', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Doc Selector Bar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <FileText style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowDocPicker(!showDocPicker)} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
            color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '6px 14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            {selectedDoc ? selectedDoc.filename : 'Select a document'}
            <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)' }} />
          </button>
          {showDocPicker && (
            <>
              <div onClick={() => setShowDocPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 320, zIndex: 50,
                background: 'rgba(26,26,30,0.95)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                padding: 6, maxHeight: 240, overflow: 'auto',
              }}>
                {docs.length === 0 ? (
                  <div style={{ padding: '16px', fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>No indexed documents. Upload a PDF first.</div>
                ) : docs.map(d => (
                  <div key={d.id} onClick={() => { setSelectedDoc(d); setShowDocPicker(false); }} style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                    background: selectedDoc?.id === d.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: selectedDoc?.id === d.id ? '#fff' : 'rgba(255,255,255,0.6)',
                  }}
                    onMouseEnter={(e) => { if (selectedDoc?.id !== d.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={(e) => { if (selectedDoc?.id !== d.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d.filename}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{d.pages} pages</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {selectedDoc && (
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '3px 10px', borderRadius: 20 }}>
            {selectedDoc.pages} pages indexed
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <Sparkles style={{ width: 40, height: 40, color: 'rgba(74,111,165,0.5)', marginBottom: 16 }} />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: '#fff', marginBottom: 8, fontWeight: 500 }}>
              What do you want to know?
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', maxWidth: 400 }}>
              Ask anything about your documents. Arcaive reasons through the document tree to find precise answers with full traceability.
            </p>
          </div>
        )}
        {messages.map((m, i) => <ChatMessage key={i} m={m} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4A6FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 style={{ width: 12, height: 12, color: '#fff', animation: 'spin 1s linear infinite' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Reasoning through document tree...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px 24px 20px' }}>
        {!selectedDoc && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '8px 0', marginBottom: 12, border: '1px solid rgba(245,158,11,0.15)' }}>
            Select a document above to start querying
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          {/* Glow border */}
          <div style={{ position: 'absolute', inset: -1, borderRadius: 18, background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />
          <div style={{
            position: 'relative', borderRadius: 18, background: '#1e1e22',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 2px 20px rgba(0,0,0,0.4)',
          }}>
            <textarea
              ref={textareaRef}
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={selectedDoc ? "Ask about your document..." : "Select a document first"}
              disabled={!selectedDoc}
              style={{
                width: '100%', resize: 'none', background: 'transparent', fontSize: 15, color: '#fff',
                padding: '18px 20px 8px', minHeight: 60, maxHeight: 200, border: 'none', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                opacity: selectedDoc ? 1 : 0.4,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '4px 12px 12px' }}>
              <button onClick={send} disabled={!input.trim() || loading || !selectedDoc} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14,
                fontSize: 14, fontWeight: 600, border: 'none', cursor: input.trim() && selectedDoc ? 'pointer' : 'default',
                background: input.trim() && selectedDoc ? '#4A6FA5' : 'rgba(255,255,255,0.06)',
                color: input.trim() && selectedDoc ? '#fff' : 'rgba(255,255,255,0.25)',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                boxShadow: input.trim() && selectedDoc ? '0 0 24px rgba(74,111,165,0.3)' : 'none',
              }}>
                Ask <Send style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
            Powered by PageIndex · Reasoning-based RAG · Enter ↵
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
