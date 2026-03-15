import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, Layers, TreePine } from 'lucide-react';

const stats = [
  { label: 'Documents', value: '4', sub: '3 indexed', icon: FileText, color: 'text-brand-blue' },
  { label: 'Queries', value: '12', sub: '+3 today', icon: Search, color: 'text-brand-blue' },
  { label: 'Accuracy', value: '98.7%', sub: 'FinanceBench', icon: Layers, color: 'text-green-600' },
  { label: 'Tree Nodes', value: '847', sub: 'Across docs', icon: TreePine, color: 'text-brand-blue' },
];

export default function Dashboard() {
  const username = localStorage.getItem('arcaive_username') || 'User';

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-1">
        Welcome back, {username}
      </h1>
      <p className="text-sm text-gray-500 mb-8">Your document intelligence overview.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="font-serif text-3xl font-semibold text-gray-900">{s.value}</div>
            <div className="text-xs text-green-600 font-mono mt-1">{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Placeholder Charts */}
      <div className="grid grid-cols-2 gap-4">
        {['Query volume chart', 'Document processing timeline'].map((t, i) => (
          <Card key={i} className="h-48 flex items-center justify-center">
            <span className="text-sm text-gray-400">{t} — connect backend</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
