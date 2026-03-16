import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Search, Layers, TreePine, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const username = localStorage.getItem('arcaive_username') || 'User';
  const token = localStorage.getItem('arcaive_token');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/documents/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        setDocs(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, []);

  const indexed = docs.filter(d => d.status === 'indexed');
  const processing = docs.filter(d => d.status === 'processing');
  const totalPages = indexed.reduce((sum, d) => sum + (d.pages || 0), 0);

  const stats = [
    { label: 'Documents', value: docs.length, sub: `${indexed.length} indexed`, icon: FileText, color: 'text-brand-blue' },
    { label: 'Total Pages', value: totalPages, sub: 'Across all docs', icon: Layers, color: 'text-brand-blue' },
    { label: 'Processing', value: processing.length, sub: 'Building trees', icon: TreePine, color: processing.length > 0 ? 'text-amber-500' : 'text-green-600' },
    { label: 'Ready to Query', value: indexed.length, sub: 'Indexed & ready', icon: Search, color: 'text-green-600' },
  ];

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-1">
        Welcome back, {username}
      </h1>
      <p className="text-sm text-gray-500 mb-8">Your document intelligence overview.</p>

      {/* Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((s, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="font-serif text-3xl font-semibold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">{s.sub}</div>
              </Card>
            ))}
          </div>

          {/* Recent Documents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Recent Documents</h2>
              <Link to="/documents" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {docs.length === 0 ? (
              <Card className="p-8 text-center">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <div className="text-sm text-gray-500 mb-3">No documents yet</div>
                <Link to="/upload" className="text-sm bg-brand-blue text-white px-5 py-2 rounded-lg font-medium inline-block hover:shadow-lg transition-all">
                  Upload your first PDF →
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {docs.slice(0, 4).map(d => (
                  <Card key={d.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-brand-blue flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{d.filename}</div>
                        <div className="font-mono text-[10px] text-gray-400">
                          {d.pages > 0 ? `${d.pages} pages` : 'Processing...'}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      d.status === 'indexed' ? 'bg-green-50 text-green-600' :
                      d.status === 'processing' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-500'
                    }`}>
                      {d.status}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/upload" className="p-5 rounded-xl border border-gray-200 bg-white hover:border-brand-blue hover:shadow-md transition-all group">
              <Upload className="w-5 h-5 text-brand-blue mb-3" />
              <div className="text-sm font-semibold text-gray-900 mb-1">Upload Document</div>
              <div className="text-xs text-gray-500">Submit a PDF for PageIndex tree generation</div>
            </Link>
            <Link to="/query" className="p-5 rounded-xl border border-gray-200 bg-white hover:border-brand-blue hover:shadow-md transition-all group">
              <Search className="w-5 h-5 text-brand-blue mb-3" />
              <div className="text-sm font-semibold text-gray-900 mb-1">Query Documents</div>
              <div className="text-xs text-gray-500">Ask questions with reasoning-based retrieval</div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
