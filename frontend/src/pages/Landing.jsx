import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

const FEATURES = [
  { icon: '🌲', title: 'Tree-Based Indexing', desc: 'Documents become intelligent hierarchies — not flat chunks.' },
  { icon: '🧠', title: 'LLM Reasoning', desc: 'Thinks through the tree like a human expert.' },
  { icon: '🔍', title: 'Traceable Retrieval', desc: 'Every answer includes a full reasoning path.' },
  { icon: '⚡', title: '98.7% Accuracy', desc: 'State-of-the-art on FinanceBench.' },
  { icon: '🔌', title: 'Connect Any Source', desc: 'PDFs, databases, any pipeline.' },
  { icon: '🏢', title: 'Enterprise Ready', desc: 'Multi-doc reasoning, audit trails, API-first.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen dark-section">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 bg-[#0E121A]/70 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-xl text-white">Arcaive</span>
        </div>
        <div className="flex items-center gap-6">
          {['Features', 'Docs', 'Pricing'].map(t => (
            <span key={t} className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">{t}</span>
          ))}
          <Link to="/auth" className="text-sm text-white border border-white/15 rounded-lg px-4 py-2 hover:border-brand-light hover:text-brand-light transition-all">
            Log In
          </Link>
          <Link to="/auth?signup=true" className="text-sm text-white brand-gradient rounded-lg px-5 py-2 font-semibold hover:shadow-lg transition-all">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 pt-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/15 border border-brand-blue/30 mb-8">
          <span className="font-mono text-xs text-brand-light">Powered by PageIndex</span>
          <span className="text-gray-500">•</span>
          <span className="font-mono text-xs text-green-400">98.7% accuracy on FinanceBench</span>
        </div>

        <h1 className="font-serif text-7xl font-medium text-white max-w-3xl leading-tight tracking-tight">
          Your documents,{' '}
          <span className="italic text-brand-light">understood.</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-xl mt-6 leading-relaxed">
          Reasoning-based retrieval that navigates complex documents like a human expert. No vector databases. No chunking. Just intelligence.
        </p>

        <div className="flex gap-3 mt-10">
          <Link to="/auth?signup=true" className="btn-primary text-base px-8 py-3.5">
            Get Started Free →
          </Link>
          <button className="btn-secondary border-white/15 text-white hover:border-brand-light hover:text-brand-light bg-white/5 text-base px-6 py-3.5">
            View Docs
          </button>
        </div>

        <div className="flex items-center gap-5 mt-14 flex-wrap justify-center">
          {['Vector DB', 'Chunking', 'Embeddings'].map(t => (
            <div key={t} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
              <span className="font-mono text-xs text-gray-500 line-through">{t}</span>
            </div>
          ))}
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-light" />
            <span className="font-mono text-xs text-brand-light">Reasoning-based retrieval</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-white">
            Built for <span className="text-brand-light italic">real</span> document intelligence
          </h2>
          <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">Not another chatbot wrapper.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-brand-blue/40 hover:-translate-y-1 hover:bg-brand-blue/[0.04] transition-all cursor-default">
              <div className="text-2xl mb-3">{f.icon}</div>
              <div className="text-sm font-semibold text-white mb-2">{f.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
