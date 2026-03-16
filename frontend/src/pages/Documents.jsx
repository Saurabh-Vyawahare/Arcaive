import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, RefreshCw, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Sidebar Tree Node ──────────────────────────────────────
function TreeNode({ node, depth = 0, selected, select }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const has = node.nodes?.length > 0;
  const isSel = selected === node.node_id;

  return (
    <div>
      <div
        onClick={() => { if (has) setExpanded(!expanded); select(node); }}
        className={`flex items-start gap-2 py-1.5 px-2.5 rounded-md cursor-pointer transition-all text-sm ${
          isSel ? 'bg-blue-50 border-l-2 border-brand-blue' : 'hover:bg-gray-100 border-l-2 border-transparent'
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        {has ? (
          <span className={`text-brand-blue text-[10px] mt-1 transition-transform inline-block ${expanded ? 'rotate-90' : ''}`}>▶</span>
        ) : (
          <span className="text-gray-300 text-[7px] mt-1.5">●</span>
        )}
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-medium ${isSel ? 'text-brand-blue' : 'text-gray-800'}`}>{node.title}</div>
          {node.start_index && (
            <div className="font-mono text-[10px] text-gray-400 mt-0.5">
              pp. {node.start_index}{node.end_index && node.end_index !== node.start_index ? `–${node.end_index}` : ''}
            </div>
          )}
        </div>
      </div>
      {has && expanded && node.nodes.map((ch, i) => (
        <TreeNode key={ch.node_id || i} node={ch} depth={depth + 1} selected={selected} select={select} />
      ))}
    </div>
  );
}

// ─── Visual Tree Map (fills blank space) ────────────────────
function TreeVisualization({ tree, selectedNode }) {
  const getNodes = (t) => t?.structure || t?.nodes || (Array.isArray(t) ? t : []);
  const topNodes = getNodes(tree);

  // Color palette for sections
  const colors = [
    { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
    { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-400' },
    { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-400' },
    { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
    { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  ];

  const isSel = (node) => selectedNode && node.node_id === selectedNode.node_id;

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Document header */}
      {tree?.doc_name && (
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Document Structure</div>
          <div className="font-serif text-lg text-gray-900">{tree.doc_name.replace('.pdf', '')}</div>
          {tree?.doc_description && (
            <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-2xl">{tree.doc_description}</p>
          )}
        </div>
      )}

      {/* Visual tree grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {topNodes.map((node, i) => {
          const c = colors[i % colors.length];
          const children = node.nodes || [];
          const selected = isSel(node);

          return (
            <div
              key={node.node_id || i}
              className={`rounded-xl border p-4 transition-all ${
                selected ? `${c.bg} ${c.border} ring-2 ring-offset-1 ring-blue-300` : `bg-white ${c.border} hover:shadow-md`
              }`}
            >
              {/* Section header */}
              <div className="flex items-start gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${c.text}`}>{node.title}</div>
                  {node.start_index && (
                    <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                      Pages {node.start_index}{node.end_index ? `–${node.end_index}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {node.summary && (
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{node.summary}</p>
              )}

              {/* Child nodes */}
              {children.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-gray-100">
                  {children.slice(0, 5).map((child, j) => (
                    <div
                      key={child.node_id || j}
                      className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition-all ${
                        isSel(child) ? `${c.bg} font-medium ${c.text}` : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      <span className="truncate">{child.title}</span>
                      {child.start_index && (
                        <span className="font-mono text-[9px] text-gray-400 ml-auto flex-shrink-0">
                          p.{child.start_index}
                        </span>
                      )}
                    </div>
                  ))}
                  {children.length > 5 && (
                    <div className="text-[10px] text-gray-400 px-2">+{children.length - 5} more sections</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <Link
          to="/query"
          className="inline-flex items-center gap-2 text-sm bg-brand-blue text-white px-5 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all"
        >
          <Search className="w-4 h-4" />
          Query this document
        </Link>
      </div>
    </div>
  );
}


// ─── Selected Node Detail Panel ─────────────────────────────
function NodeDetail({ node }) {
  if (!node) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-20 max-h-48 overflow-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{node.title}</div>
          {node.start_index && (
            <div className="font-mono text-[10px] text-brand-blue mt-0.5">
              Pages {node.start_index}{node.end_index ? `–${node.end_index}` : ''}
            </div>
          )}
        </div>
        {node.node_id && (
          <span className="font-mono text-[9px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
            {node.node_id}
          </span>
        )}
      </div>
      {node.summary && (
        <p className="text-xs text-gray-600 leading-relaxed mt-2">{node.summary}</p>
      )}
    </div>
  );
}


// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  const [tree, setTree] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const token = localStorage.getItem('arcaive_token');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/documents/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setDocs(data);
      if (data.length > 0 && !activeDoc) {
        setActiveDoc(data[0]);
        if (data[0].status === 'indexed') fetchTree(data[0].id);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchTree = async (docId) => {
    setTreeLoading(true); setTree(null);
    try {
      const res = await fetch(`${API}/documents/${docId}/tree`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) { const data = await res.json(); setTree(data.tree); }
    } catch (err) { console.error(err); }
    setTreeLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const selectDoc = (doc) => {
    setActiveDoc(doc); setTree(null); setSelectedNode(null);
    if (doc.status === 'indexed') fetchTree(doc.id);
  };

  const renderSidebarTree = () => {
    if (!tree) return null;
    const nodes = tree.structure || tree.nodes || (Array.isArray(tree) ? tree : [tree]);
    if (Array.isArray(nodes)) {
      return nodes.map((n, i) => <TreeNode key={n.node_id || i} node={n} selected={selectedNode?.node_id} select={setSelectedNode} />);
    }
    return <TreeNode node={nodes} selected={selectedNode?.node_id} select={setSelectedNode} />;
  };

  return (
    <div className="flex h-full">
      {/* Left Panel — Doc List + Tree */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Documents</h3>
            <button onClick={fetchDocs} className="text-gray-400 hover:text-brand-blue transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-brand-blue animate-spin" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <div className="text-xs text-gray-400">No documents yet</div>
              <Link to="/upload" className="text-[10px] text-brand-blue hover:underline mt-1 inline-block">Upload a PDF →</Link>
            </div>
          ) : (
            docs.map(d => (
              <div key={d.id} onClick={() => selectDoc(d)}
                className={`p-2.5 rounded-lg mb-1.5 cursor-pointer border transition-all ${
                  activeDoc?.id === d.id ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium truncate ${activeDoc?.id === d.id ? 'text-brand-blue' : 'text-gray-800'}`}>{d.filename}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 font-medium ${
                    d.status === 'indexed' ? 'bg-green-50 text-green-600' : d.status === 'processing' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'
                  }`}>{d.status}</span>
                </div>
                {d.pages > 0 && <div className="font-mono text-[10px] text-gray-400 mt-1">{d.pages} pages</div>}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Tree */}
        <div className="flex-1 overflow-auto p-3">
          {activeDoc && activeDoc.status === 'indexed' && (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Document Tree</span>
                <span className="text-[9px] font-mono text-brand-blue bg-blue-50 px-2 py-0.5 rounded">PageIndex</span>
              </div>
              {treeLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-4 h-4 text-brand-blue animate-spin" /></div>
              ) : tree ? renderSidebarTree() : (
                <div className="text-xs text-gray-400 text-center py-4">No tree data</div>
              )}
            </>
          )}
          {activeDoc && activeDoc.status === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
              <div className="text-xs text-gray-500">Building tree...</div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Tree Visualization */}
      <div className="flex-1 bg-gray-50/30 relative overflow-hidden">
        {activeDoc && activeDoc.status === 'indexed' && tree ? (
          <>
            <TreeVisualization tree={tree} selectedNode={selectedNode} />
            {selectedNode && <NodeDetail node={selectedNode} />}
          </>
        ) : activeDoc && activeDoc.status === 'processing' ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <div className="font-serif text-lg text-gray-900">Building document tree...</div>
            <div className="text-sm text-gray-500">PageIndex is analyzing the structure. This takes 30-120 seconds.</div>
          </div>
        ) : activeDoc ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4">🌲</div>
            <h2 className="font-serif text-xl text-gray-900 mb-2">{activeDoc.filename}</h2>
            <p className="text-sm text-gray-500">Document status: {activeDoc.status}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <div className="font-serif text-lg text-gray-400 mb-2">Select a document</div>
            <div className="text-sm text-gray-400 max-w-sm">Choose a document from the sidebar to explore its tree structure, or <Link to="/upload" className="text-brand-blue hover:underline">upload a new one</Link>.</div>
          </div>
        )}
      </div>
    </div>
  );
}
