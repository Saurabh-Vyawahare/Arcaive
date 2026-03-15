import React, { useState } from 'react';
import { Card } from '@/components/ui/card';

// Mock data — will be replaced with API calls
const DOCS = [
  { id: 'd1', name: 'SEC Annual Report 2024', pages: 142, status: 'indexed', date: 'Mar 10' },
  { id: 'd2', name: 'Drug Safety Compliance Guide', pages: 87, status: 'indexed', date: 'Mar 12' },
  { id: 'd3', name: 'Enterprise Credit Policy v3.1', pages: 64, status: 'indexed', date: 'Mar 14' },
  { id: 'd4', name: 'GDPR Data Processing Manual', pages: 51, status: 'processing', date: 'Mar 15' },
];

const TREE = {
  title: 'SEC Annual Report 2024', node_id: 'root',
  summary: 'Financial performance, risk factors, compliance, market analysis.',
  nodes: [
    { title: 'Executive Summary', node_id: 'n1', pages: 'pp. 1–6',
      nodes: [
        { title: 'Financial Highlights', node_id: 'n1a', pages: 'pp. 1–3' },
        { title: 'Strategic Outlook', node_id: 'n1b', pages: 'pp. 4–6' },
      ] },
    { title: 'Risk Factors', node_id: 'n2', pages: 'pp. 7–28',
      nodes: [
        { title: 'Market & Economic', node_id: 'n2a', pages: 'pp. 7–15' },
        { title: 'Operational', node_id: 'n2b', pages: 'pp. 16–22' },
        { title: 'Regulatory & Legal', node_id: 'n2c', pages: 'pp. 23–28' },
      ] },
    { title: 'Financial Statements', node_id: 'n3', pages: 'pp. 29–85',
      nodes: [
        { title: 'Balance Sheet', node_id: 'n3a', pages: 'pp. 29–42' },
        { title: 'Income Statement', node_id: 'n3b', pages: 'pp. 43–58' },
        { title: 'Cash Flow', node_id: 'n3c', pages: 'pp. 59–70' },
      ] },
    { title: 'Corporate Governance', node_id: 'n4', pages: 'pp. 86–105' },
    { title: 'Market Analysis', node_id: 'n5', pages: 'pp. 106–142' },
  ],
};

function TreeNode({ node, depth = 0, expanded, toggle, selected, select }) {
  const has = node.nodes?.length > 0;
  const isExp = expanded.has(node.node_id);
  const isSel = selected === node.node_id;

  return (
    <div>
      <div
        onClick={() => { if (has) toggle(node.node_id); select(node.node_id); }}
        className={`flex items-start gap-2 py-1.5 px-2.5 rounded-md cursor-pointer transition-all text-sm ${
          isSel ? 'bg-blue-50 border-l-2 border-brand-blue' : 'hover:bg-gray-100 border-l-2 border-transparent'
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        {has ? (
          <span className={`text-brand-blue text-[10px] mt-1 transition-transform ${isExp ? 'rotate-90' : ''}`}>▶</span>
        ) : (
          <span className="text-gray-300 text-[7px] mt-1.5">●</span>
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium ${isSel ? 'text-brand-blue' : 'text-gray-800'}`}>{node.title}</div>
          {node.pages && <div className="font-mono text-[10px] text-gray-400 mt-0.5">{node.pages}</div>}
          {isSel && node.summary && <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">{node.summary}</div>}
        </div>
      </div>
      {has && isExp && node.nodes.map(ch => (
        <TreeNode key={ch.node_id} node={ch} depth={depth + 1} expanded={expanded} toggle={toggle} selected={selected} select={select} />
      ))}
    </div>
  );
}

export default function Documents() {
  const [activeDoc, setActiveDoc] = useState(DOCS[0]);
  const [expanded, setExpanded] = useState(new Set(['root', 'n2', 'n3']));
  const [selected, setSelected] = useState(null);

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex h-full">
      {/* Document List + Tree */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Indexed Documents</h3>
          {DOCS.map(d => (
            <div
              key={d.id}
              onClick={() => setActiveDoc(d)}
              className={`p-2.5 rounded-lg mb-1.5 cursor-pointer border transition-all ${
                activeDoc.id === d.id
                  ? 'border-brand-blue bg-blue-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-medium ${activeDoc.id === d.id ? 'text-brand-blue' : 'text-gray-800'}`}>{d.name}</span>
                <span className={`badge text-[10px] ${d.status === 'indexed' ? 'badge-success' : 'badge-warning'}`}>{d.status}</span>
              </div>
              <div className="font-mono text-[10px] text-gray-400 mt-1">{d.pages} pp • {d.date}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Document Tree</span>
            <span className="text-[9px] font-mono text-brand-blue bg-blue-50 px-2 py-0.5 rounded">LIVE</span>
          </div>
          <TreeNode node={TREE} expanded={expanded} toggle={toggle} selected={selected} select={setSelected} />
        </div>
      </div>

      {/* Main content area — placeholder for query integration */}
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <div className="text-4xl mb-4">🌲</div>
          <h2 className="font-serif text-xl text-gray-900 mb-2">Document Tree Loaded</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Select a document and navigate the tree. Go to <strong>Query</strong> to ask questions about your documents.
          </p>
        </div>
      </div>
    </div>
  );
}
