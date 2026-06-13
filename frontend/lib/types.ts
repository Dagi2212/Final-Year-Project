export interface PaginationMeta {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  firstPage: number;
  firstPageUrl: string | null;
  lastPageUrl: string | null;
  nextPageUrl: string | null;
  previousPageUrl: string | null;
}

export interface PaginatedResponse<T> {
  meta: PaginationMeta;
  data: T[];
}

export interface Organization {
  id: string;
  name: string;
  type?: 'cooperative' | 'ngo' | 'government' | 'private' | null;
  region?: string | null;
  contactPhone?: string | null;
  farmerCount?: number;
  plotCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: string;
  organizationId?: string | null;
  email?: string | null;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: 'admin' | 'field_agent' | 'supervisor' | 'gov' | 'ngo' | 'trader' | 'researcher' | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  serialNumber?: string | null;
  status: 'online' | 'offline' | 'inactive';
  assignedUserId?: string | null;
  assignedUser?: AppUser | null;
  user?: AppUser | null;
  lastSyncTime?: string | null;
  userId: string;
  deviceName?: string | null;
  deviceUuid: string;
  lastSyncAt?: string | null;
  createdAt: string;
}

export interface CropType {
  id: string;
  name: string;
  localName?: string | null;
  category?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface Farmer {
  id: string;
  organizationId?: string | null;
  fullName: string;
  phone?: string | null;
  locationRegion?: string | null;
  locationZone?: string | null;
  locationWoreda?: string | null;
  householdSize?: number | null;
  notes?: string | null;
  createdBy: string;
  deviceId?: string | null;
  clientCreatedAt?: string | null;
  clientUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  plotCount?: number;
}

export interface Plot {
  id: string;
  farmerId: string;
  plotName?: string | null;
  areaSqm?: number | null;
  areaLocal?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  altitude?: number | null;
  soilType?: string | null;
  irrigation: boolean;
  createdBy: string;
  deviceId?: string | null;
  clientCreatedAt?: string | null;
  clientUpdatedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  observationCount?: number;
}

export interface Observation {
  id: string;
  plotId: string;
  cropTypeId: string;
  plantingDate?: string | null;
  expectedYieldKg?: number | null;
  actualYieldKg?: number | null;
  yieldEstimateDate?: string | null;
  growthStage?: string | null;
  healthStatus?: string | null;
  pestIssues?: string | null;
  fertilizerUsed: boolean;
  notes?: string | null;
  metadata?: Record<string, any>;
  createdBy: string;
  deviceId?: string | null;
  clientCreatedAt?: string | null;
  clientUpdatedAt?: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Attachment {
  id: string;
  observationId?: string | null;
  fileUrl: string;
  fileType?: string | null;
  fileSizeBytes?: number | null;
  caption?: string | null;
  uploadedBy: string;
  deviceId?: string | null;
  clientCreatedAt?: string | null;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  deviceId: string;
  userId: string;
  batchId: string;
  entityType: 'farmer' | 'plot' | 'observation' | 'attachment';
  entityId?: string | null;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, any>;
  clientTimestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'conflict';
  retryCount: number;
  errorMessage?: string | null;
  resolvedAt?: string | null;
  serverTimestamp: string;
  createdAt: string;
  processedAt?: string | null;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC';
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface DashboardFarmerCount {
  organization_id: string;
  organization_name: string;
  farmer_count: string | number;
  new_farmers_30d: string | number;
}


export interface DashboardYieldSummary {
  crop_name: string;
  local_name: string | null;
  crop_type_id: string;
  observation_count: string | number;
  avg_expected_yield_kg: string | number | null;
  avg_actual_yield_kg: string | number | null;
  earliest_planting: string | null;
  latest_planting: string | null;
}


export interface DashboardSyncStatus {
  device_id: string;
  device_uuid: string;
  agent_name: string;
  pending_count: string | number;
  failed_count: string | number;
  conflict_count: string | number;
  last_sync: string | null;
}

export interface DashboardRecentLog {
  id: string;
  table_name: string;
  action: string;
  record_id: string;
  created_at: string;
  user_id: string | null;
  userName: string;
}


export interface DashboardImportStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalImportedRows: number;
}

export interface DashboardPredictionStats {
  total: number;
  completed: number;
  avgPredictedYieldKg: number | null;
}

export interface DashboardIndexResponse {
  summary: {
    totalFarmers: number;
    totalPlots: number;
    totalExpectedYieldKg: number;
    totalActualYieldKg: number;
    pendingSyncs: number;
  };
  farmerCounts?: DashboardFarmerCount[];
  yieldSummary: DashboardYieldSummary[];
  syncStatus?: DashboardSyncStatus[];
  recentLogs?: DashboardRecentLog[];
  importStats?: DashboardImportStats;
  predictionStats?: DashboardPredictionStats;
}


export interface DashboardStats {
  totalFarmers: number;
  totalPlots: number;
  totalObservations: number;
  recentObservations: Observation[];
  deviceStatus: {
    online: number;
    offline: number;
    inactive: number;
  };
}

export type User = AppUser;

// ─── AI / RAG ────────────────────────────────────────────────────────────────

export interface RagCitation {
  source: string;
  description: string;
  row_count: number;
}

export interface RagQueryResponse {
  status: string;
  query_id: string;
  question: string;
  dataset_type: string;
  answer: string;
  citations: RagCitation[];
  context_summary: string;
  tokens_used?: number;
  llm_provider: string;
  llm_model: string;
}

export interface RagStatus {
  rag_status: string;
  llm_provider: string;
  llm_model: string;
  api_key_configured: boolean;
  db_accessible: boolean;
}

// ─── ML Predictions ─────────────────────────────────────────────────────────

export interface Prediction {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  modelVersion: string;
  inputFeatures: Record<string, any>;
  predictedYieldKg: number | null;
  confidenceScore: number | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface MlHealth {
  status: string;
  model_version: string;
  model_type?: string;
  mae_kg?: number;
  rmse_kg?: number;
  feature_columns?: string[];
}

// ─── Data Imports ────────────────────────────────────────────────────────────

export interface ImportBatch {
  id: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorSummary?: Record<string, any> | null;
  importedBy: string;
  createdAt: string;
}

export interface ImportedRecord {
  id: string;
  importBatchId: string;
  rowNumber: number;
  status: 'valid' | 'invalid';
  cropName?: string;
  region?: string;
  season?: string;
  year?: number;
  areaHectares?: number;
  rainfallMm?: number;
  temperatureCelsius?: number;
  fertilizerAmountKg?: number;
  actualYieldKg?: number;
  validationErrors?: string[];
}

// ─── Monetization ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  priceUsd: number;
  productType: 'dataset' | 'analytics' | 'subscription';
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  startedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  productId: string;
  amountUsd: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentProvider?: string | null;
  paymentReference?: string | null;
  createdAt: string;
}
