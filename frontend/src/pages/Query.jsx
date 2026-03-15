import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const INITIAL_MESSAGES = [
  { role: 'user', content: 'What are the key risk factors related to regulatory compliance mentioned in the report?' },
  {
    role: 'assistant',
    content: 'Based on my analysis, the report identifies three primary regulatory risk areas:\n\n1. SEC Reporting Compliance — Internal controls flagged for enhancement.\n\n2. Data Privacy Regulations — GDPR, CCPA multi-jurisdictional complexity.\n\n3. Industry-Specific Regulations — Pending rulemaking, $12–18M annual compliance cost.\n\nAdditional budget allocated for compliance infrastructure in FY2025.',
    path: ['root → Risk Factors (n2)', '→ Regulatory & Legal (n2c)', 'Pages 23–28 retrieved'],
  },
];

function ChatMessage({ m }) {
  const isUser = m.role === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
          isUser ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'brand-gradient text-white'
        }`}>
          {isUser ? 'U' : 'A'}
        </div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          {isUser ? 'You' : 'Arcaive'}
        </span>
      </div>
      <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'brand-gradient text-white rounded-2xl rounded-br-sm'
          : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm'
      }`}>
        {m.content}
      </div>
      {m.path && (
        <div className="reasoning-path mt-2 max-w-[85%]">
          <div className="text-[9px] font-semibold text-brand-blue uppercase tracking-wider mb-1">Reasoning Path</div>
          {m.path.map((s, i) => (
            <div key={i} className="font-mono text-[10px] text-gray-500 leading-relaxed">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Query() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || typing) return;
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
    setInput('');
    setTyping(true);

    // TODO: Replace with real API call
    // const token = localStorage.getItem('arcaive_token');
    // const response = await fetch('/query/ask', { ... });

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'ve traversed the document tree and located the relevant sections. The reasoning path shows how I navigated the index.\n\nConnect the FastAPI backend with PageIndex API key for real answers.',
        path: ['root → Section via tree traversal', '→ Subsection located', 'Pages retrieved'],
      }]);
      setTyping(false);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {messages.map((m, i) => (
          <ChatMessage key={i} m={m} />
        ))}
        {typing && (
          <div className="flex items-center gap-2 py-2">
            <div className="w-5 h-5 rounded-full brand-gradient flex items-center justify-center text-[9px] text-white font-bold">A</div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
              ))}
            </div>
            <span className="font-mono text-[10px] text-gray-400">Reasoning through tree...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents..."
            rows={1}
            className="flex-1 bg-transparent border-none text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none min-h-[20px] max-h-[80px] font-sans"
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              input.trim() ? 'brand-gradient text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-default'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[9px] text-gray-400">Powered by PageIndex • Vectorless RAG</span>
          <span className="font-mono text-[9px] text-gray-400">Enter ↵</span>
        </div>
      </div>
    </div>
  );
}
