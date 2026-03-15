import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [fileName, setFileName] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadStatus('error');
      setFileName('Only PDF files are supported');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');

    // TODO: Replace with real API call
    // const token = localStorage.getItem('arcaive_token');
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('http://localhost:8000/documents/upload', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` },
    //   body: formData,
    // });

    // Mock upload
    setTimeout(() => {
      setUploadStatus('success');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-1">Upload Documents</h1>
      <p className="text-sm text-gray-500 mb-8">Submit PDFs for PageIndex tree generation.</p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-blue bg-blue-50/50'
            : 'border-gray-200 hover:border-brand-blue hover:bg-blue-50/30'
        }`}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />
        <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-4" />
        <div className="text-base font-medium text-gray-900 mb-2">Drag & drop PDFs here</div>
        <div className="text-sm text-gray-500 mb-1">or click to browse files</div>
        <div className="font-mono text-xs text-gray-400">PDF up to 200 pages • Free tier: 200 pages total</div>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <Card className="mt-6 p-4">
          <div className="flex items-center gap-3">
            {uploadStatus === 'uploading' && (
              <>
                <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Uploading {fileName}...</div>
                  <div className="text-xs text-gray-500">Submitting to PageIndex for tree generation</div>
                </div>
              </>
            )}
            {uploadStatus === 'success' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{fileName}</div>
                  <div className="text-xs text-green-600">Uploaded successfully — tree generation in progress</div>
                </div>
              </>
            )}
            {uploadStatus === 'error' && (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-sm font-medium text-red-600">{fileName}</div>
                  <div className="text-xs text-red-500">Upload failed — please try again</div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-gray-200">
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">How it works:</strong> PageIndex generates a hierarchical tree structure from your document — no chunking, no embeddings. The LLM then reasons through this tree to find answers with full traceability.
          </div>
        </div>
      </div>
    </div>
  );
}
