'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle,
  Loader2, AlertCircle, Clock, Eye, ChevronDown, ChevronUp
} from 'lucide-react';

interface ImportRecord {
  id: string;
  fileName: string;
  file_name?: string;
  originalFileName?: string;
  totalRows: number;
  total_rows?: number;
  validRows: number;
  valid_rows?: number;
  invalidRows: number;
  invalid_rows?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorSummary?: Record<string, any> | null;
  error_summary?: Record<string, any> | null;
  importedBy: string;
  imported_by?: string;
  createdAt: string;
  created_at?: string;
}

interface ImportDetail {
  id: string;
  rowNumber: number;
  row_number?: number;
  status: 'valid' | 'invalid';
  cropName?: string;
  crop_name?: string;
  region?: string;
  season?: string;
  year?: number;
  actualYieldKg?: number;
  actual_yield_kg?: number;
  validationErrors?: string[];
  validation_errors?: string[];
}

const statusBadge = (status: string) => {
  const map: Record<string, JSX.Element> = {
    completed: <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>,
    failed: <Badge variant="destructive">Failed</Badge>,
    processing: <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>,
    pending: <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>,
  };
  return map[status] || <Badge variant="outline">{status}</Badge>;
};

export default function ImportsPage() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ImportDetail[]>>({});
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImports();
  }, []);

  const fetchImports = async () => {
    try {
      const res = await apiClient.get<any>('/imports?limit=20');
      setImports(res.data || []);
    } catch {
      toast.error('Failed to load imports');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    const allowed = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel', 'application/csv'];
    const extOk = file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!allowed.includes(file.type) && !extOk) {
      toast.error('Only CSV and XLSX files are supported');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be under 50 MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = apiClient.getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/api/v1/imports`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || 'Upload failed');
      }

      toast.success(`"${file.name}" imported successfully`);
      fetchImports();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const toggleDetails = async (imp: ImportRecord) => {
    const id = imp.id;
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (details[id]) return;

    setDetailsLoading(id);
    try {
      const res = await apiClient.get<any>(`/imports/${id}/records?limit=50`);
      setDetails((d) => ({ ...d, [id]: res.data || [] }));
    } catch {
      toast.error('Failed to load import details');
    } finally {
      setDetailsLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="w-7 h-7 text-primary" />
          Data Imports
        </h1>
        <p className="text-muted-foreground mt-1">
          Bulk import historical agricultural records from CSV or Excel files
        </p>
      </div>

      {/* Upload zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload File</CardTitle>
          <CardDescription className="text-xs">
            CSV or XLSX · Max 50 MB · Required columns: crop_name, season, region, year,
            area_hectares, actual_yield_kg
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
              ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-medium">Uploading and validating…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium">Drop your file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV · XLSX · XLS</p>
                </div>
                <Button variant="outline" size="sm" disabled={uploading}>
                  Choose File
                </Button>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Sample format hint */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground font-mono">
            <p className="font-semibold text-foreground mb-1">Expected column format:</p>
            crop_name, season, region, year, area_hectares, rainfall_mm,
            temperature_celsius, fertilizer_amount_kg, actual_yield_kg
          </div>
        </CardContent>
      </Card>

      {/* Import history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : imports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No imports yet. Upload your first file above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {imports.map((imp) => {
                const fileName = imp.fileName || imp.file_name || imp.originalFileName || 'Unknown file';
                const totalRows = imp.totalRows ?? imp.total_rows ?? 0;
                const validRows = imp.validRows ?? imp.valid_rows ?? 0;
                const invalidRows = imp.invalidRows ?? imp.invalid_rows ?? 0;
                const date = imp.createdAt || imp.created_at;
                const isExpanded = expandedId === imp.id;

                return (
                  <div key={imp.id} className="border rounded-lg overflow-hidden">
                    {/* Row */}
                    <div className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                      <FileSpreadsheet className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {date ? new Date(date).toLocaleString() : ''}
                        </p>
                      </div>

                      {/* Row counts */}
                      <div className="flex gap-4 text-xs">
                        <span className="text-muted-foreground">{totalRows.toLocaleString()} rows</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" /> {validRows.toLocaleString()}
                        </span>
                        {invalidRows > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="w-3 h-3" /> {invalidRows.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {statusBadge(imp.status)}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toggleDetails(imp)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Expanded detail rows */}
                    {isExpanded && (
                      <div className="border-t bg-muted/30 p-4">
                        {detailsLoading === imp.id ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (details[imp.id] || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No records to display</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b text-muted-foreground">
                                  <th className="text-left py-1.5 px-2">Row</th>
                                  <th className="text-left py-1.5 px-2">Crop</th>
                                  <th className="text-left py-1.5 px-2">Region</th>
                                  <th className="text-left py-1.5 px-2">Season</th>
                                  <th className="text-right py-1.5 px-2">Year</th>
                                  <th className="text-right py-1.5 px-2">Yield (kg)</th>
                                  <th className="text-left py-1.5 px-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {details[imp.id].map((row) => {
                                  const rowNum = row.rowNumber ?? row.row_number;
                                  const crop = row.cropName || row.crop_name || '-';
                                  const yield_kg = row.actualYieldKg ?? row.actual_yield_kg;
                                  const errors = row.validationErrors || row.validation_errors || [];
                                  return (
                                    <tr key={row.id} className={`border-b ${row.status === 'invalid' ? 'bg-red-50' : ''}`}>
                                      <td className="py-1.5 px-2 text-muted-foreground">{rowNum}</td>
                                      <td className="py-1.5 px-2 capitalize">{crop}</td>
                                      <td className="py-1.5 px-2">{row.region || '-'}</td>
                                      <td className="py-1.5 px-2 capitalize">{row.season || '-'}</td>
                                      <td className="py-1.5 px-2 text-right">{row.year || '-'}</td>
                                      <td className="py-1.5 px-2 text-right font-mono">
                                        {yield_kg != null ? Number(yield_kg).toLocaleString() : '-'}
                                      </td>
                                      <td className="py-1.5 px-2">
                                        {row.status === 'valid' ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                        ) : (
                                          <div className="flex items-center gap-1">
                                            <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            {errors.length > 0 && (
                                              <span className="text-red-600">{errors[0]}</span>
                                            )}
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
