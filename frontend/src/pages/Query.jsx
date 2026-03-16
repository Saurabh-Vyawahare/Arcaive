import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, Loader2, ChevronDown } from 'lucide-react';

const API = 'http://localhost:8000';

function ChatMessage({ m }) {
  const isUser = m.role === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-5`}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
          isUser ? 'bg-gray-100 text-gray-500 border border-gray-200' : 'bg-brand-blue text-white'
        }`}>{isUser ? 'U' : 'A'}</div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          {isUser ? 'You' : 'Arcaive'}
        </span>
      </div>
      <div className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-brand-blue text-white rounded-2xl rounded-br-sm'
          : 'bg-gray-50 text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm'
      }`}>
        {m.content}
      </div>
      {m.reasoning_path && m.reasoning_path.length > 0 && (
        <div className="mt-2 max-w-[85%] p-2.5 bg-blue-50/60 border border-gray-200 rounded-lg">
          <div className="text-[9px] font-semibold text-brand-blue uppercase tracking-wider mb-1">Reasoning Path</div>
          {m.reasoning_path.map((step, i) => (
            <div key={i} className="font-mono text-[10px] text-gray-600 leading-relaxed">
              {i > 0 && '→ '}{step.node_title} {step.pages && <span className="text-gray-400">({step.pages})</span>}
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
  const inputRef = useRef(null);

  const token = localStorage.getItem('arcaive_token');

  // Load indexed documents
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/documents/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        const indexed = data.filter(d => d.status === 'indexed');
        setDocs(indexed);
        if (indexed.length > 0) setSelectedDoc(indexed[0]);
      } catch (err) {
        console.error('Failed to load docs:', err);
      }
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading || !selectedDoc) return;
    const question = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/query/ask`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          doc_id: selectedDoc.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Query failed');
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        reasoning_path: data.reasoning_path,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}`,
      }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Doc Selector Bar */}
      <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
        <FileText className="w-4 h-4 text-gray-400" />
        <div className="relative">
          <button
            onClick={() => setShowDocPicker(!showDocPicker)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-brand-blue transition-all"
          >
            {selectedDoc ? selectedDoc.filename : 'Select a document'}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showDocPicker && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-60 overflow-auto">
              {docs.length === 0 ? (
                <div className="px-3 py-4 text-xs text-gray-400 text-center">No indexed documents. Upload a PDF first.</div>
              ) : (
                docs.map(d => (
                  <div
                    key={d.id}
                    onClick={() => { setSelectedDoc(d); setShowDocPicker(false); }}
                    className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedDoc?.id === d.id ? 'bg-blue-50 text-brand-blue' : 'text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{d.filename}</div>
                    <div className="font-mono text-[10px] text-gray-400">{d.pages} pages</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {selectedDoc && (
          <span className="text-[10px] font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">
            {selectedDoc.pages} pages indexed
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="font-serif text-xl text-gray-900 mb-2">Ask anything about your documents</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Arcaive uses reasoning-based retrieval — the LLM thinks through the document tree to find precise answers with full traceability.
            </p>
          </div>
        )}
        {messages.map((m, i) => <ChatMessage key={i} m={m} />)}
        {loading && (
          <div className="flex items-center gap-2 py-2">
            <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            </div>
            <span className="font-mono text-[10px] text-gray-400">Reasoning through document tree...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-6 py-4">
        {!selectedDoc && (
          <div className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg py-2 mb-3">
            Select a document above to start querying
          </div>
        )}
        <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2.5">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedDoc ? "Ask about your document..." : "Select a document first"}
            disabled={!selectedDoc}
            rows={1}
            className="flex-1 bg-transparent border-none text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none min-h-[20px] max-h-[80px] font-sans disabled:opacity-50"
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'; }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading || !selectedDoc}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              input.trim() && selectedDoc ? 'bg-brand-blue text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-default'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[9px] text-gray-400">Powered by PageIndex • Reasoning-based RAG</span>
          <span className="font-mono text-[9px] text-gray-400">Enter ↵</span>
        </div>
      </div>
    </div>
  );
}
