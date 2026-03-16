import React, { useState, useEffect } from 'react';
import { FileText, Loader2, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function TreeNode({ node, depth = 0, selected, select }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const has = node.nodes?.length > 0;
  const isSel = selected === node.node_id;

  return (
    <div>
      <div
        onClick={() => { if (has) setExpanded(!expanded); select(node.node_id); }}
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
          {isSel && node.summary && (
            <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">{node.summary}</div>
          )}
        </div>
      </div>
      {has && expanded && node.nodes.map((ch, i) => (
        <TreeNode key={ch.node_id || i} node={ch} depth={depth + 1} selected={selected} select={select} />
      ))}
    </div>
  );
}

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
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
    setLoading(false);
  };

  const fetchTree = async (docId) => {
    setTreeLoading(true);
    setTree(null);
    try {
      const res = await fetch(`${API}/documents/${docId}/tree`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTree(data.tree);
      }
    } catch (err) {
      console.error('Failed to fetch tree:', err);
    }
    setTreeLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const selectDoc = (doc) => {
    setActiveDoc(doc);
    setTree(null);
    setSelectedNode(null);
    if (doc.status === 'indexed') fetchTree(doc.id);
  };

  // Render tree — handles both {structure: [...]} and direct node format
  const renderTree = () => {
    if (!tree) return null;
    const nodes = tree.structure || tree.nodes || (Array.isArray(tree) ? tree : [tree]);
    if (Array.isArray(nodes)) {
      return nodes.map((n, i) => (
        <TreeNode key={n.node_id || i} node={n} selected={selectedNode} select={setSelectedNode} />
      ));
    }
    return <TreeNode node={nodes} selected={selectedNode} select={setSelectedNode} />;
  };

  return (
    <div className="flex h-full">
      {/* Doc List */}
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Documents</h3>
            <button onClick={fetchDocs} className="text-gray-400 hover:text-brand-blue transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <div className="text-xs text-gray-400">No documents yet</div>
              <div className="text-[10px] text-gray-400 mt-1">Upload a PDF to get started</div>
            </div>
          ) : (
            docs.map(d => (
              <div
                key={d.id}
                onClick={() => selectDoc(d)}
                className={`p-2.5 rounded-lg mb-1.5 cursor-pointer border transition-all ${
                  activeDoc?.id === d.id ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-medium truncate ${activeDoc?.id === d.id ? 'text-brand-blue' : 'text-gray-800'}`}>
                    {d.filename}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ml-2 font-medium ${
                    d.status === 'indexed' ? 'bg-green-50 text-green-600' :
                    d.status === 'processing' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {d.status}
                  </span>
                </div>
                {d.pages > 0 && <div className="font-mono text-[10px] text-gray-400 mt-1">{d.pages} pages</div>}
              </div>
            ))
          )}
        </div>

        {/* Tree Panel */}
        <div className="flex-1 overflow-auto p-3">
          {activeDoc && activeDoc.status === 'indexed' && (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Document Tree</span>
                <span className="text-[9px] font-mono text-brand-blue bg-blue-50 px-2 py-0.5 rounded">PageIndex</span>
              </div>
              {treeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />
                </div>
              ) : tree ? (
                renderTree()
              ) : (
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

      {/* Right panel — doc info */}
      <div className="flex-1 flex items-center justify-center bg-gray-50/50 p-8">
        {activeDoc ? (
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">🌲</div>
            <h2 className="font-serif text-xl text-gray-900 mb-2">{activeDoc.filename}</h2>
            <p className="text-sm text-gray-500">
              {activeDoc.status === 'indexed'
                ? `${activeDoc.pages} pages indexed. Tree structure ready — explore it in the sidebar or go to Query to ask questions.`
                : activeDoc.status === 'processing'
                ? 'PageIndex is building the document tree. This takes 30-120 seconds...'
                : 'Processing failed. Try re-uploading the document.'
              }
            </p>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <div className="text-sm text-gray-400">Select a document to view its tree</div>
          </div>
        )}
      </div>
    </div>
  );
}
