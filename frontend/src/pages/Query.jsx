import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Loader2, ChevronDown, Plus, Sparkles, ArrowLeft } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Arc curve SVG in Arcaive blue
function ArcBackground() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 3000, height: 1400, pointerEvents: 'none', overflow: 'hidden' }}>
      <svg viewBox="0 0 3000 1400" style={{ width: '100%', height: '100%' }}>
        <ellipse cx="1500" cy="1400" rx="1500" ry="600" fill="none" stroke="#4A6FA5" strokeWidth="2" opacity="0.15" />
        <ellipse cx="1500" cy="1400" rx="1480" ry="590" fill="none" stroke="#5B82BB" strokeWidth="1.5" opacity="0.1" />
        <ellipse cx="1500" cy="1400" rx="1460" ry="580" fill="none" stroke="#6B9FD4" strokeWidth="1" opacity="0.08" />
        <ellipse cx="1500" cy="1400" rx="1440" ry="570" fill="none" stroke="#4A6FA5" strokeWidth="3" opacity="0.06" />
        {/* Glow on top of arc */}
        <defs>
          <radialGradient id="arcGlow" cx="50%" cy="100%" r="40%">
            <stop offset="0%" stopColor="#4A6FA5" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#4A6FA5" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="1500" cy="1400" rx="1500" ry="600" fill="url(#arcGlow)" />
      </svg>
    </div>
  );
}

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
          fontSize: 10, fontWeight: 700, background: isUser ? '#F0F4FA' : '#4A6FA5', color: isUser ? '#4A6FA5' : '#fff',
          border: isUser ? '1.5px solid #4A6FA5' : 'none',
        }}>{isUser ? 'U' : 'A'}</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isUser ? 'You' : 'Arcaive'}
        </span>
      </div>
      <div style={{
        maxWidth: '85%', padding: '14px 18px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? '#4A6FA5' : '#F3F6FA', color: isUser ? '#fff' : '#1A1F2E',
        border: isUser ? 'none' : '1px solid #E8ECF2',
      }}>
        {renderMarkdown(m.content)}
      </div>
      {m.reasoning_path && m.reasoning_path.length > 0 && (
        <div style={{
          marginTop: 8, maxWidth: '85%', padding: '10px 14px',
          background: '#F0F4FA', border: '1px solid #D6E3F5', borderRadius: 12,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#4A6FA5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Reasoning Path</div>
          {m.reasoning_path.map((step, i) => (
            <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#5A6478', lineHeight: 1.6 }}>
              {i > 0 && '→ '}{step.node_title} {step.pages && <span style={{ color: '#9CA3AF' }}>({step.pages})</span>}
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
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'; }
  }, [input]);

  const send = async () => {
    if (!input.trim() || loading || !selectedDoc) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/query/ask`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  const hasMessages = messages.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>

      {/* Arc background - only show when no messages */}
      {!hasMessages && <ArcBackground />}

      {/* Doc Selector - top bar */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12, zIndex: 20, background: '#fff' }}>
        <FileText style={{ width: 16, height: 16, color: '#9CA3AF' }} />
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowDocPicker(!showDocPicker)} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500,
            color: '#1A1F2E', background: '#F9FAFB', border: '1.5px solid #E5E7EB',
            borderRadius: 10, padding: '6px 14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            {selectedDoc ? selectedDoc.filename : 'Select a document'}
            <ChevronDown style={{ width: 14, height: 14, color: '#9CA3AF' }} />
          </button>
          {showDocPicker && (
            <>
              <div onClick={() => setShowDocPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{
                position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 320, zIndex: 50,
                background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14,
                boxShadow: '0 12px 40px rgba(0,0,0,0.1)', padding: 6, maxHeight: 240, overflow: 'auto',
              }}>
                {docs.length === 0 ? (
                  <div style={{ padding: 16, fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>No indexed documents yet.</div>
                ) : docs.map(d => (
                  <div key={d.id} onClick={() => { setSelectedDoc(d); setShowDocPicker(false); }} style={{
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                    background: selectedDoc?.id === d.id ? '#F0F4FA' : 'transparent',
                  }}
                    onMouseEnter={(e) => { if (selectedDoc?.id !== d.id) e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseLeave={(e) => { if (selectedDoc?.id !== d.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: selectedDoc?.id === d.id ? '#4A6FA5' : '#1A1F2E' }}>{d.filename}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{d.pages} pages</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {selectedDoc && (
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 20, border: '1px solid #A7F3D0' }}>
            {selectedDoc.pages} pages indexed
          </span>
        )}
      </div>

      {/* Messages / Empty State */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px', position: 'relative', zIndex: 10 }}>
        {!hasMessages && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 44, fontWeight: 500,
              color: '#1A1F2E', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 12,
            }}>
              What do you want to{' '}
              <span style={{
                background: 'linear-gradient(to bottom, #4A6FA5, #5B82BB)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
              }}>know</span>
              ?
            </h1>
            <p style={{ fontSize: 15, color: '#8B95A8', maxWidth: 440 }}>
              Ask questions about your documents. Arcaive reasons through the tree to find precise answers with full traceability.
            </p>
          </div>
        )}
        {hasMessages && messages.map((m, i) => <ChatMessage key={i} m={m} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4A6FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 style={{ width: 12, height: 12, color: '#fff', animation: 'spin 1s linear infinite' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9CA3AF' }}>Reasoning through document tree...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area - bolt style with Arcaive colors */}
      <div style={{ padding: '16px 24px 20px', zIndex: 20, position: 'relative' }}>
        {!selectedDoc && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#B45309', background: '#FEF3C7', borderRadius: 10, padding: '8px 0', marginBottom: 12, border: '1px solid #FDE68A' }}>
            Select a document above to start querying
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          {/* Subtle glow border */}
          <div style={{ position: 'absolute', inset: -1, borderRadius: 18, background: 'linear-gradient(to bottom, rgba(74,111,165,0.15), rgba(74,111,165,0.05))', pointerEvents: 'none' }} />
          <div style={{
            position: 'relative', borderRadius: 18, background: '#F9FAFB',
            border: '1.5px solid #E5E7EB',
            boxShadow: '0 2px 20px rgba(74,111,165,0.06)',
          }}>
            <textarea
              ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={selectedDoc ? "Ask about your document..." : "Select a document first"}
              disabled={!selectedDoc}
              style={{
                width: '100%', resize: 'none', background: 'transparent', fontSize: 15, color: '#1A1F2E',
                padding: '18px 20px 8px', minHeight: 70, maxHeight: 200, border: 'none', outline: 'none',
                fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                opacity: selectedDoc ? 1 : 0.4,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #E5E7EB', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9CA3AF',
                }}>
                  <Plus style={{ width: 14, height: 14 }} />
                </button>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>GPT-5.4</span>
              </div>
              <button onClick={send} disabled={!input.trim() || loading || !selectedDoc} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 14,
                fontSize: 14, fontWeight: 600, border: 'none',
                cursor: input.trim() && selectedDoc ? 'pointer' : 'default',
                background: input.trim() && selectedDoc ? '#4A6FA5' : '#E5E7EB',
                color: input.trim() && selectedDoc ? '#fff' : '#9CA3AF',
                transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif",
                boxShadow: input.trim() && selectedDoc ? '0 2px 16px rgba(74,111,165,0.25)' : 'none',
              }}>
                Ask now <Send style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#C4C9D4' }}>
            Powered by PageIndex · Reasoning-based RAG · Enter ↵
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
