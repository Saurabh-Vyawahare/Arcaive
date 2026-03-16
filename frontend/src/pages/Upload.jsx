import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState(null); // null|uploading|processing|indexed|error
  const [fileName, setFileName] = useState('');
  const [docId, setDocId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('arcaive_token');

  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error'); setErrorMsg('Only PDF files are supported'); return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      setDocId(data.doc_id);
      setStatus('processing');

      // Poll for status
      pollStatus(data.doc_id);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/documents/${id}/status`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.status === 'indexed') {
          clearInterval(interval);
          setStatus('indexed');
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setStatus('error');
          setErrorMsg('Tree generation failed. Try a smaller document.');
        }
      } catch {
        // Keep polling
      }
    }, 3000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-1">Upload Documents</h1>
      <p className="text-sm text-gray-500 mb-8">Submit PDFs for PageIndex tree generation.</p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !status && document.getElementById('file-input').click()}
        className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all ${
          status ? 'cursor-default' : 'cursor-pointer'
        } ${isDragging ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:border-brand-blue hover:bg-blue-50/30'}`}
      >
        <input id="file-input" type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />

        {!status && (
          <>
            <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <div className="text-base font-medium text-gray-900 mb-2">Drag & drop PDFs here</div>
            <div className="text-sm text-gray-500 mb-1">or click to browse files</div>
            <div className="font-mono text-xs text-gray-400">Recommended: start with 10-50 page documents</div>
          </>
        )}

        {status === 'uploading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <div className="text-sm font-medium text-gray-900">Uploading {fileName}...</div>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            <div className="text-sm font-medium text-gray-900">Building document tree...</div>
            <div className="text-xs text-gray-500">PageIndex is analyzing structure with GPT-4o. This takes 30-120 seconds.</div>
            <div className="font-mono text-xs text-brand-blue mt-2">Status: processing</div>
          </div>
        )}

        {status === 'indexed' && (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="text-sm font-medium text-gray-900">{fileName}</div>
            <div className="text-xs text-green-600">Tree generation complete — document is ready to query!</div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate('/documents')} className="text-sm bg-brand-blue text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                View Tree →
              </button>
              <button onClick={() => navigate('/query')} className="text-sm border border-brand-blue text-brand-blue px-5 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all">
                Ask Questions
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div className="text-sm font-medium text-red-600">{errorMsg}</div>
            <button onClick={() => { setStatus(null); setErrorMsg(''); }} className="text-sm text-brand-blue hover:underline mt-2">
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-gray-200">
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">How it works:</strong> PageIndex generates a hierarchical tree structure from your document — no chunking, no embeddings. The LLM reasons through this tree to find answers with full traceability.
          </div>
        </div>
      </div>
    </div>
  );
}
