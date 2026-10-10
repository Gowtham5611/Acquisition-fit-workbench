import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Database, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
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
      toast.success('Import and deduplication completed');
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
      toast.success(`Loaded ${res.rows_imported} targets (${res.duplicates_found} duplicates merged)`);
    } catch (e: any) {
      toast.error(e.message || 'Demo load failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          Lead Intake & Deduplication Engine
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Normalize domains, validate firmographic criteria, and merge duplicates into unified company records.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-950/30'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-indigo-400 mb-3" />
            <h3 className="text-base font-semibold text-slate-100 mb-1">
              Upload Acquisition Target CSV
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Drag and drop your spreadsheet here or click to browse
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
            
            <button
              type="button"
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shadow-sm disabled:opacity-50"
            >
              Browse Files
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-950 text-slate-500 font-mono">OR</span>
            </div>
          </div>

          {/* One-Click Demo Dataset Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center shrink-0">
                <Database className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">
                  Load Curated Sourcing Dataset (175 Records)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-populated with 160 companies across 14 industries + 15 deliberate duplicates to test all 4 matrix quadrants.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadDemo}
              disabled={isUploading}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors shrink-0 disabled:opacity-50"
            >
              {isUploading ? 'Loading Dataset...' : 'Seed Prototype Dataset'}
            </button>
          </div>
        </div>
      ) : (
        /* Import Audit Results Card */
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg space-y-6 p-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Intake Audit Report</h3>
              <p className="text-xs text-slate-400">Normalization and deduplication results summary</p>
            </div>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Import Another File
            </button>
          </div>

          {/* Outcome Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            result.records_inserted > 0
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
          }`}>
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${result.records_inserted > 0 ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Intake Outcome</h4>
              <p className="text-xs font-medium mt-0.5 text-slate-100">{result.message}</p>
            </div>
          </div>

          {/* 6 Granular Audit Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] font-semibold uppercase text-slate-400">Received</span>
              <span className="block text-xl font-bold font-mono text-slate-100 mt-1">{result.rows_received}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Raw CSV rows</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <span className="block text-[10px] font-semibold uppercase text-slate-400">Valid Rows</span>
              <span className="block text-xl font-bold font-mono text-slate-100 mt-1">{result.valid_rows}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Validated data</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-emerald-950">
              <span className="block text-[10px] font-semibold uppercase text-emerald-400">New Companies</span>
              <span className="block text-xl font-bold font-mono text-emerald-300 mt-1">{result.records_inserted}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Inserted to DB</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-950">
              <span className="block text-[10px] font-semibold uppercase text-cyan-400">Existing Matches</span>
              <span className="block text-xl font-bold font-mono text-cyan-300 mt-1">{result.existing_matches}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Already in DB</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-amber-950">
              <span className="block text-[10px] font-semibold uppercase text-amber-400">Duplicate Rows</span>
              <span className="block text-xl font-bold font-mono text-amber-300 mt-1">{result.duplicate_rows}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">In-upload dupes</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-indigo-950">
              <span className="block text-[10px] font-semibold uppercase text-indigo-400">Records Enriched</span>
              <span className="block text-xl font-bold font-mono text-indigo-300 mt-1">{result.records_updated}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Fields merged</span>
            </div>
          </div>

          {/* Validation Errors / Warnings */}
          {result.errors.length > 0 && (
            <div className="border border-rose-900/40 bg-rose-950/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Validation Log ({result.errors.length} items flagged)</span>
              </div>
              <ul className="text-xs text-rose-300/90 list-disc pl-5 space-y-1 max-h-36 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {result.records_inserted > 0 || result.records_updated > 0
                  ? 'Records successfully committed to local SQLite database.'
                  : 'Database state preserved — all uploaded records matched existing database records without modifications.'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors shrink-0"
            >
              <span>Proceed to Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
