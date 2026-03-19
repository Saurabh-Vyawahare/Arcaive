import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Check, Sparkles, ArrowRight } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/30">
      {/* Nav */}
      <nav className="flex items-center justify-between px-9 py-3.5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center"><Layers className="w-4 h-4 text-white" /></div>
          <span className="font-serif text-xl text-gray-900">Arcaive</span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/docs" className="text-sm text-gray-500 hover:text-brand-blue transition-colors">Docs</Link>
          <Link to="/auth?signup=true" className="text-sm text-white bg-brand-blue rounded-lg px-5 py-1.5 font-semibold">Get Started</Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl font-medium text-gray-900 mb-4">Simple pricing</h1>
          <p className="text-lg text-gray-500">No tiers. No limits. No surprises.</p>
        </div>

        {/* Glass Card */}
        <div className="relative max-w-md w-full">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/30 via-brand-blue/20 to-purple-200/30 rounded-3xl blur-2xl" />

          <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl shadow-blue-100/50 p-10 text-center"
               style={{ boxShadow: '0 8px 60px rgba(74,111,165,0.12), 0 2px 8px rgba(74,111,165,0.06)' }}>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-green-500" />
              <span className="font-mono text-xs text-green-600">Open Source</span>
            </div>

            <div className="font-serif text-6xl font-medium text-gray-900 mb-2">Free</div>
            <div className="text-sm text-gray-500 mb-8">for everyone, forever</div>

            <div className="space-y-3 text-left mb-8">
              {[
                'Unlimited document uploads',
                'Full PageIndex tree generation',
                'Reasoning-based query with traces',
                'Interactive tree visualization',
                'JWT authentication',
                'API access via Swagger',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <Link to="/auth?signup=true" className="w-full flex items-center justify-center gap-2 text-white bg-brand-blue rounded-xl px-8 py-3.5 font-semibold text-base hover:shadow-lg transition-all">
              Start Building <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Fine print */}
        <div className="mt-10 max-w-md text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            Arcaive is an open-source project. Self-host it for free. You just need an OpenAI API key for GPT-5 (tree generation + queries). Supabase free tier handles the database. The Railway $5/mo free credit covers the backend.
          </p>
        </div>
      </div>
    </div>
  );
}
