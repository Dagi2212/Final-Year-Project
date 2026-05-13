'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { TrendingUp, Loader2, CheckCircle2, XCircle, Clock, Cpu } from 'lucide-react';

interface Prediction {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  modelVersion: string;
  model_version?: string;
  inputFeatures: Record<string, any>;
  input_features?: Record<string, any>;
  predictedYieldKg: number | null;
  predicted_yield_kg?: number | null;
  confidenceScore: number | null;
  errorMessage?: string | null;
  error_message?: string | null;
  createdAt: string;
  created_at?: string;
}

interface MlHealth {
  status: string;
  model_version: string;
  mae_kg?: number;
  rmse_kg?: number;
}

const CROP_OPTIONS = ['teff', 'maize', 'wheat', 'sorghum', 'barley', 'coffee', 'sesame', 'chickpea'];
const SEASON_OPTIONS = ['meher', 'belg'];

const statusIcon = (status: string) => {
  if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
};

const statusBadge = (status: string) => {
  if (status === 'completed') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
  if (status === 'failed') return <Badge variant="destructive">Failed</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
};

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mlHealth, setMlHealth] = useState<MlHealth | null>(null);

  const [form, setForm] = useState({
    crop_name: 'teff',
    area_hectares: '',
    rainfall_mm: '',
    temperature_celsius: '',
    fertilizer_amount_kg: '',
    season: 'meher',
    year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    fetchPredictions();
    fetchMlHealth();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await apiClient.get<any>('/predictions?limit=20');
      setPredictions(res.data || []);
    } catch {
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMlHealth = async () => {
    try {
      const h = await apiClient.get<MlHealth>('/predictions/ml-health');
      setMlHealth(h);
    } catch {
      // ML service may not be running
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        crop_name: form.crop_name,
        season: form.season,
        year: form.year ? Number(form.year) : undefined,
        area_hectares: form.area_hectares ? Number(form.area_hectares) : undefined,
        rainfall_mm: form.rainfall_mm ? Number(form.rainfall_mm) : undefined,
        temperature_celsius: form.temperature_celsius ? Number(form.temperature_celsius) : undefined,
        fertilizer_amount_kg: form.fertilizer_amount_kg ? Number(form.fertilizer_amount_kg) : undefined,
      };
      await apiClient.post('/predictions', payload);
      toast.success('Prediction created successfully');
      fetchPredictions();
    } catch (err: any) {
      toast.error(err.message || 'Prediction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'number', placeholder = '') => (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="h-8 text-sm"
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            Yield Predictions
          </h1>
          <p className="text-muted-foreground mt-1">
            ML-powered crop yield forecasting using GradientBoosting model
          </p>
        </div>

        {/* ML Health Badge */}
        <div className="flex items-center gap-2 text-sm">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          {mlHealth ? (
            <span className={`flex items-center gap-1.5 ${mlHealth.status === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              <span className={`w-2 h-2 rounded-full ${mlHealth.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
              ML Service {mlHealth.status === 'ok' ? 'Ready' : 'Offline'}
              {mlHealth.mae_kg && (
                <span className="text-muted-foreground ml-1">· MAE {mlHealth.mae_kg.toLocaleString()} kg</span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">ML Service unreachable</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">New Prediction</CardTitle>
            <CardDescription className="text-xs">
              Enter crop parameters to predict yield
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Crop</label>
                <Select value={form.crop_name} onValueChange={(v) => setForm((f) => ({ ...f, crop_name: v }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Season</label>
                <Select value={form.season} onValueChange={(v) => setForm((f) => ({ ...f, season: v }))}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASON_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {field('area_hectares', 'Area (hectares)', 'number', 'e.g. 2.5')}
              {field('rainfall_mm', 'Annual Rainfall (mm)', 'number', 'e.g. 850')}
              {field('temperature_celsius', 'Temperature (°C)', 'number', 'e.g. 22')}
              {field('fertilizer_amount_kg', 'Fertilizer (kg)', 'number', 'e.g. 50')}
              {field('year', 'Year', 'number', 'e.g. 2025')}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Predicting…</>
                ) : (
                  'Predict Yield'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No predictions yet. Create your first one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 px-3">Crop</th>
                      <th className="text-left py-2 px-3">Season</th>
                      <th className="text-right py-2 px-3">Area (ha)</th>
                      <th className="text-right py-2 px-3">Predicted (kg)</th>
                      <th className="text-left py-2 px-3">Model</th>
                      <th className="text-left py-2 px-3">Status</th>
                      <th className="text-left py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p) => {
                      const features = p.inputFeatures || p.input_features || {};
                      const yieldKg = p.predictedYieldKg ?? p.predicted_yield_kg;
                      const version = p.modelVersion || p.model_version || '-';
                      const status = p.status;
                      const date = p.createdAt || p.created_at;
                      return (
                        <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3 font-medium capitalize">{features.crop_name || '-'}</td>
                          <td className="py-2 px-3 capitalize">{features.season || '-'}</td>
                          <td className="py-2 px-3 text-right">{features.area_hectares ?? '-'}</td>
                          <td className="py-2 px-3 text-right font-mono">
                            {yieldKg != null ? (
                              <span className="text-green-700 font-semibold">
                                {Number(yieldKg).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-xs text-muted-foreground font-mono">{version.slice(0, 13)}</td>
                          <td className="py-2 px-3">{statusBadge(status)}</td>
                          <td className="py-2 px-3 text-xs text-muted-foreground">
                            {date ? new Date(date).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model info card */}
      {mlHealth && mlHealth.status === 'ok' && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground text-xs block">Model Version</span>
                <span className="font-mono font-medium">{mlHealth.model_version}</span>
              </div>
              {mlHealth.mae_kg && (
                <div>
                  <span className="text-muted-foreground text-xs block">Mean Abs. Error</span>
                  <span className="font-medium">{mlHealth.mae_kg.toLocaleString()} kg</span>
                </div>
              )}
              {mlHealth.rmse_kg && (
                <div>
                  <span className="text-muted-foreground text-xs block">RMSE</span>
                  <span className="font-medium">{mlHealth.rmse_kg.toLocaleString()} kg</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-xs block">Algorithm</span>
                <span className="font-medium">Gradient Boosting Regressor</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block">Training Data</span>
                <span className="font-medium">2,000 Ethiopian crop records</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
