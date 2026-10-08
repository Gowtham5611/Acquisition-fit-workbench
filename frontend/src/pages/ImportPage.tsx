import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Database } from 'lucide-react';
import { api } from '../services/api';
import { ImportResult } from '../types';
import toast from 'react-hot-toast';

export default function ImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    setIsUploading(true);
    setResult(null);
    try {
      const res = await api.importCSV(file);
      setResult(res);
      toast.success('Import completed');
    } catch (e: any) {
      toast.error(e.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };

  const loadDemo = async () => {
    setIsUploading(true);
    setResult(null);
    try {
      const res = await api.loadDemo();
      setResult(res);
      toast.success(`Successfully loaded ${res.rows_imported} demo leads (${res.duplicates_found} duplicates merged)`);
    } catch (e: any) {
      toast.error(e.message || 'Demo load failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Import Leads</h2>

      {!result ? (
        <div className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Drag and drop your CSV file here</h3>
            <p className="text-sm text-slate-500 mb-6">or click to browse from your computer</p>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Browse Files
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-slate-50 text-sm text-slate-500">OR</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h4 className="text-base font-medium text-slate-900">Load Demo Dataset</h4>
                <p className="text-sm text-slate-500">Populate the workbench with synthetic B2B leads for testing.</p>
              </div>
            </div>
            <button
              onClick={loadDemo}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 py-5 sm:px-6 bg-slate-50 border-b border-slate-200">
            <h3 className="text-lg leading-6 font-medium text-slate-900">Import Results</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-slate-50 p-4 rounded-md text-center">
                <span className="block text-sm font-medium text-slate-500">Received</span>
                <span className="block text-2xl font-semibold text-slate-900">{result.rows_received}</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-md text-center">
                <span className="block text-sm font-medium text-emerald-600">Imported</span>
                <span className="block text-2xl font-semibold text-emerald-700">{result.rows_imported}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-md text-center">
                <span className="block text-sm font-medium text-amber-600">Duplicates</span>
                <span className="block text-2xl font-semibold text-amber-700">{result.duplicates_found}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-md text-center">
                <span className="block text-sm font-medium text-red-600">Invalid</span>
                <span className="block text-2xl font-semibold text-red-700">{result.invalid_rows}</span>
              </div>
            </div>
            
            {result.errors.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-red-800 mb-2">Errors & Warnings</h4>
                <div className="bg-red-50 rounded-md p-4 text-sm text-red-700 max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5 space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
