import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, TreePine, Brain, Search, FileText, Zap, GitBranch } from 'lucide-react';

const STEPS = [
  { num: '01', icon: FileText, title: 'Upload PDF', desc: 'Drop any PDF. Research papers, legal docs, financial reports, 200+ page textbooks. No size limits that matter.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { num: '02', icon: TreePine, title: 'Tree Generation', desc: 'PageIndex reads every page using AI and builds a hierarchical tree structure, like an intelligent table of contents with summaries at every level.', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { num: '03', icon: Brain, title: 'Reasoning Query', desc: 'Ask a question. The LLM reasons through the tree: "This question is about X → Section 3 covers X → Pages 12-18 have the detail." It thinks, not searches.', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { num: '04', icon: Search, title: 'Traced Answer', desc: 'Get a precise answer with a full reasoning path showing which sections were used, which pages, and WHY. Complete traceability, zero black boxes.', color: 'bg-amber-50 text-amber-600 border-amber-200' },
];

export default function Docs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-9 py-3.5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center"><Layers className="w-4 h-4 text-white" /></div>
          <span className="font-serif text-xl text-gray-900">Arcaive</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/pricing" className="text-sm text-gray-500 hover:text-brand-blue transition-colors">Pricing</Link>
          <Link to="/auth?signup=true" className="text-sm text-white bg-brand-blue rounded-lg px-5 py-1.5 font-semibold">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
          <GitBranch className="w-3.5 h-3.5 text-brand-blue" />
          <span className="font-mono text-xs text-brand-blue">Open Source • PageIndex Framework</span>
        </div>
        <h1 className="font-serif text-5xl font-medium text-gray-900 leading-tight mb-5">
          How <span className="italic text-brand-light">Arcaive</span> works
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          A fundamentally different approach to document retrieval. No vectors, no embeddings, no chunking. Just reasoning.
        </p>
      </div>

      {/* The Problem */}
      <div className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100">
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Traditional RAG</div>
            <div className="space-y-2">
              {['Chunk document into pieces', 'Embed with ada-002', 'Store in vector database', 'Cosine similarity search', 'Hope you got the right chunks', 'Feed to LLM'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-red-300">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm text-gray-600">{s}</span>
                  {i < 5 && <ArrowRight className="w-3 h-3 text-red-300 ml-auto" />}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-red-100">
              <div className="font-mono text-xs text-red-400">Similarity ≠ relevance</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-green-50/50 border border-green-100">
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">Arcaive (PageIndex)</div>
            <div className="space-y-2">
              {['Read full document structure', 'Build hierarchical tree', 'LLM reasons through tree', 'Identify exact pages', 'Extract precise context', 'Generate traced answer'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-green-400">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm text-gray-600">{s}</span>
                  {i < 5 && <ArrowRight className="w-3 h-3 text-green-400 ml-auto" />}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-green-100">
              <div className="font-mono text-xs text-green-600">Reasoning = understanding</div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-gray-900">The pipeline</h2>
          <p className="text-sm text-gray-500 mt-2">Four steps from document to answer.</p>
        </div>

        <div className="space-y-6">
          {STEPS.map((step, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${step.color} flex items-start gap-5 transition-all hover:-translate-y-0.5`}>
              <div className="flex-shrink-0">
                <div className="font-mono text-3xl font-bold opacity-20">{step.num}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className="w-4 h-4" />
                  <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Connector arrows between steps */}
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          {['Upload', 'Tree', 'Reason', 'Answer'].map((s, i) => (
            <React.Fragment key={i}>
              <span className="font-mono text-xs text-brand-blue bg-blue-50 px-3 py-1 rounded-full">{s}</span>
              {i < 3 && <ArrowRight className="w-4 h-4 text-gray-300" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Accuracy Section */}
      <div className="max-w-3xl mx-auto px-8 pb-20">
        <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100">
          <div className="font-serif text-5xl font-medium text-brand-blue mb-3">98.7%</div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Accuracy on FinanceBench</div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
            PageIndex significantly outperforms traditional vector-based RAG on complex financial documents. The tree-reasoning approach excels at multi-hop questions that require understanding document structure, not just keyword matching.
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-3xl mx-auto px-8 pb-20">
        <h2 className="font-serif text-2xl text-center text-gray-900 mb-8">Tech Stack</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Backend', items: 'Python • FastAPI • PageIndex' },
            { label: 'Database', items: 'Supabase PostgreSQL • JSONB' },
            { label: 'AI', items: 'OpenAI GPT-5 Series • PyMuPDF' },
            { label: 'Frontend', items: 'React • Vite • Tailwind' },
            { label: 'Auth', items: 'JWT • bcrypt • Bearer tokens' },
            { label: 'Deploy', items: 'Railway • Vercel' },
          ].map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <div className="text-xs font-semibold text-brand-blue uppercase tracking-wider mb-1">{t.label}</div>
              <div className="text-xs text-gray-600">{t.items}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-20">
        <Link to="/auth?signup=true" className="inline-flex items-center gap-2 text-white bg-brand-blue rounded-xl px-8 py-3.5 font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all">
          Try Arcaive Free <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="text-xs text-gray-400 mt-3">No credit card required</div>
      </div>
    </div>
  );
}
