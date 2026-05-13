/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { authThrottle, resetThrottle, verificationThrottle } from '#start/limiter'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import {
  IMPORT_ROLES,
  PREDICTION_ROLES,
  QUERY_ROLES,
  ANALYTICS_ROLES,
} from '#services/role_constants'

// ---------------------------------------------------------------------------
// Root health check (unauthenticated)
// ---------------------------------------------------------------------------
router.get('/', () => ({ hello: 'world', version: '1.0.0' }))

// ---------------------------------------------------------------------------
// API v1
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Controller dynamic imports
// ---------------------------------------------------------------------------
const DashboardController = () => import('#controllers/dashboard_controller')
const OrganizationsController = () => import('#controllers/organizations_controller')
const AppUsersController = () => import('#controllers/app_users_controller')
const DevicesController = () => import('#controllers/devices_controller')
const CropTypesController = () => import('#controllers/crop_types_controller')
const FarmersController = () => import('#controllers/farmers_controller')
const PlotsController = () => import('#controllers/plots_controller')
const ObservationsController = () => import('#controllers/observations_controller')
const AttachmentsController = () => import('#controllers/attachments_controller')
const SyncQueueController = () => import('#controllers/sync_queue_controller')
const AuditLogsController = () => import('#controllers/audit_logs_controller')
const ImportsController = () => import('#controllers/imports_controller')
const PredictionsController = () => import('#controllers/predictions_controller')
const RagController = () => import('#controllers/rag_controller')
const MonetizationController = () => import('#controllers/monetization_controller')

router
  .group(() => {
    // -----------------------------------------------------------------------
    // Auth routes (existing — untouched)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store']).use(authThrottle)
        router.post('login', [controllers.AccessToken, 'store']).use(authThrottle)
        router.post('refresh', [controllers.AccessToken, 'refresh']).use(middleware.auth())
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
        router.post('logout-all', [controllers.AccessToken, 'destroyAll']).use(middleware.auth())
        router.get('tokens', [controllers.AccessToken, 'index']).use(middleware.auth())
        router
          .delete('tokens/:tokenId', [controllers.AccessToken, 'revoke'])
          .use(middleware.auth())

        router.post('password/forgot', [controllers.PasswordReset, 'forgot']).use(resetThrottle)
        router.post('password/reset', [controllers.PasswordReset, 'reset']).use(resetThrottle)

        router
          .post('email/verification-notification', [controllers.EmailVerification, 'send'])
          .use(middleware.auth())
          .use(verificationThrottle)
        router
          .post('email/verify', [controllers.EmailVerification, 'verify'])
          .use(verificationThrottle)
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
        router.patch('/profile', [controllers.Profile, 'update'])
        router.delete('/profile', [controllers.Profile, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // -----------------------------------------------------------------------
    // Dashboard
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/', [DashboardController, 'index'])
        router.get('/farmer-counts', [DashboardController, 'farmerCounts'])
        router.get('/yield-summary', [DashboardController, 'yieldSummary'])
        router.get('/sync-status', [DashboardController, 'syncStatus'])
        router.get('/health', [DashboardController, 'health'])
      })
      .prefix('dashboard')
      .as('dashboard')

    // -----------------------------------------------------------------------
    // Organizations
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/', [OrganizationsController, 'index'])
        router.post('/', [OrganizationsController, 'store'])
        router.get('/:id', [OrganizationsController, 'show'])
        router.patch('/:id', [OrganizationsController, 'update'])
        router.delete('/:id', [OrganizationsController, 'destroy'])
        router.get('/:id/dashboard', [OrganizationsController, 'dashboard'])
      })
      .prefix('organizations')
      .as('organizations')

    // -----------------------------------------------------------------------
    // App Users (field agents, supervisors, admins)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/', [AppUsersController, 'index'])
        router.post('/', [AppUsersController, 'store'])
        router.get('/:id', [AppUsersController, 'show'])
        router.patch('/:id', [AppUsersController, 'update'])
        router.delete('/:id', [AppUsersController, 'destroy'])
        router.patch('/:id/activate', [AppUsersController, 'activate'])
        router.get('/:id/devices', [AppUsersController, 'devices'])
      })
      .prefix('app-users')
      .as('appUsers')

    // -----------------------------------------------------------------------
    // Devices
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/', [DevicesController, 'index'])
        router.post('/', [DevicesController, 'store'])
        router.get('/by-uuid/:deviceUuid', [DevicesController, 'showByUuid'])
        router.get('/:id', [DevicesController, 'show'])
        router.patch('/:id', [DevicesController, 'update'])
        router.patch('/:id/sync', [DevicesController, 'markSynced'])
        router.delete('/:id', [DevicesController, 'destroy'])
      })
      .prefix('devices')
      .as('devices')

    // -----------------------------------------------------------------------
    // Crop Types
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/categories', [CropTypesController, 'categories'])
        router.get('/', [CropTypesController, 'index'])
        router.post('/', [CropTypesController, 'store'])
        router.get('/:id', [CropTypesController, 'show'])
        router.patch('/:id', [CropTypesController, 'update'])
        router.delete('/:id', [CropTypesController, 'destroy'])
      })
      .prefix('crop-types')
      .as('cropTypes')

    // -----------------------------------------------------------------------
    // Farmers
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/stats', [FarmersController, 'stats'])
        router.get('/', [FarmersController, 'index'])
        router.post('/', [FarmersController, 'store'])
        router.get('/:id', [FarmersController, 'show'])
        router.patch('/:id', [FarmersController, 'update'])
        router.delete('/:id', [FarmersController, 'destroy'])
        router.post('/:id/restore', [FarmersController, 'restore'])
        router.get('/:id/plots', [FarmersController, 'plots'])
      })
      .prefix('farmers')
      .as('farmers')

    // -----------------------------------------------------------------------
    // Plots (farm parcels)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/nearby', [PlotsController, 'nearby'])
        router.get('/', [PlotsController, 'index'])
        router.post('/', [PlotsController, 'store'])
        router.get('/:id', [PlotsController, 'show'])
        router.patch('/:id', [PlotsController, 'update'])
        router.delete('/:id', [PlotsController, 'destroy'])
        router.post('/:id/restore', [PlotsController, 'restore'])
      })
      .prefix('plots')
      .as('plots')

    // -----------------------------------------------------------------------
    // Observations (crop yield surveys)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/summary', [ObservationsController, 'summary'])
        router.get('/', [ObservationsController, 'index'])
        router.post('/', [ObservationsController, 'store'])
        router.get('/:id', [ObservationsController, 'show'])
        router.patch('/:id', [ObservationsController, 'update'])
        router.delete('/:id', [ObservationsController, 'destroy'])
        router.post('/:id/restore', [ObservationsController, 'restore'])
        router.patch('/:id/harvest', [ObservationsController, 'recordHarvest'])
        // Nested attachments
        router.get('/:observationId/attachments', [AttachmentsController, 'byObservation'])
      })
      .prefix('observations')
      .as('observations')

    // -----------------------------------------------------------------------
    // Attachments (field photos)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/', [AttachmentsController, 'index'])
        router.post('/', [AttachmentsController, 'store'])
        router.get('/:id', [AttachmentsController, 'show'])
        router.patch('/:id', [AttachmentsController, 'update'])
        router.delete('/:id', [AttachmentsController, 'destroy'])
      })
      .prefix('attachments')
      .as('attachments')

    // -----------------------------------------------------------------------
    // Sync Queue (offline-first batch processing)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/stats', [SyncQueueController, 'stats'])
        router.get('/', [SyncQueueController, 'index'])
        router.post('/', [SyncQueueController, 'store'])
        router.post('/batch', [SyncQueueController, 'batch'])
        router.get('/:id', [SyncQueueController, 'show'])
        router.patch('/:id/status', [SyncQueueController, 'updateStatus'])
        router.post('/:id/retry', [SyncQueueController, 'retry'])
        router.delete('/:id', [SyncQueueController, 'destroy'])
      })
      .prefix('sync-queue')
      .as('syncQueue')

    // -----------------------------------------------------------------------
    // Audit Logs (read-only for compliance)
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/stats', [AuditLogsController, 'stats'])
        router.get('/record/:tableName/:recordId', [AuditLogsController, 'byRecord'])
        router.get('/', [AuditLogsController, 'index'])
        router.post('/', [AuditLogsController, 'store'])
        router.get('/:id', [AuditLogsController, 'show'])
      })
      .prefix('audit-logs')
      .as('auditLogs')

    // -----------------------------------------------------------------------
    // Data Import (CSV / Excel) — IMPORT_ROLES
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.post('/', [ImportsController, 'store'])
        router.get('/', [ImportsController, 'index'])
        router.get('/:id', [ImportsController, 'show'])
        router.get('/:id/schema', [ImportsController, 'schema'])
        router.get('/:id/records', [ImportsController, 'records'])
      })
      .prefix('imports')
      .as('imports')
      .use(middleware.auth())
      .use(middleware.roleGuard({ roles: IMPORT_ROLES }))

    // -----------------------------------------------------------------------
    // ML Predictions — PREDICTION_ROLES
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/ml-health', [PredictionsController, 'mlHealth'])
        router.post('/', [PredictionsController, 'store'])
        router.get('/', [PredictionsController, 'index'])
        router.get('/:id', [PredictionsController, 'show'])
      })
      .prefix('predictions')
      .as('predictions')
      .use(middleware.auth())
      .use(middleware.roleGuard({ roles: PREDICTION_ROLES }))

    // -----------------------------------------------------------------------
    // RAG / Intelligent Query — QUERY_ROLES
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/status', [RagController, 'status'])
        router.post('/query', [RagController, 'query'])
      })
      .prefix('rag')
      .as('rag')
      .use(middleware.auth())
      .use(middleware.roleGuard({ roles: QUERY_ROLES }))

    // -----------------------------------------------------------------------
    // Monetization (products / subscriptions / transactions) — authenticated
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/products', [MonetizationController, 'listProducts'])
        router
          .post('/products', [MonetizationController, 'storeProduct'])
          .use(middleware.roleGuard({ roles: ['admin'] }))
        router.get('/products/:id', [MonetizationController, 'showProduct'])
        router
          .patch('/products/:id', [MonetizationController, 'updateProduct'])
          .use(middleware.roleGuard({ roles: ['admin'] }))
        router.get('/subscriptions', [MonetizationController, 'listSubscriptions'])
        router.post('/subscriptions', [MonetizationController, 'storeSubscription'])
        router.get('/transactions', [MonetizationController, 'listTransactions'])
        // Chapa webhook – no auth, Chapa calls this directly
        router.post('/chapa/webhook', [MonetizationController, 'chapaWebhook'])
      })
      .prefix('monetization')
      .as('monetization')
      .use(middleware.auth())

    // -----------------------------------------------------------------------
    // Analytics aggregates — ANALYTICS_ROLES
    // -----------------------------------------------------------------------
    router
      .group(() => {
        router.get('/import-trends', async ({ response }) => {
          const db = (await import('@adonisjs/lucid/services/db')).default
          const rows = await db
            .from('import_jobs')
            .select(
              db.raw("DATE_TRUNC('day', created_at) as date"),
              db.raw('COUNT(*) as job_count'),
              db.raw('SUM(imported_rows) as imported_rows')
            )
            .whereRaw("created_at >= NOW() - INTERVAL '30 days'")
            .groupByRaw("DATE_TRUNC('day', created_at)")
            .orderBy('date', 'asc')
          return response.ok(rows)
        }).as('importTrends')
        router.get('/yield-trends', async ({ response }) => {
          const db = (await import('@adonisjs/lucid/services/db')).default
          const rows = await db
            .from('imported_records')
            .select(
              'crop_name',
              'year',
              'season',
              db.raw('AVG(actual_yield_kg) as avg_yield_kg'),
              db.raw('COUNT(*) as record_count')
            )
            .whereNotNull('actual_yield_kg')
            .groupBy('crop_name', 'year', 'season')
            .orderBy(['year', 'season'])
          return response.ok(rows)
        }).as('yieldTrends')
      })
      .prefix('analytics')
      .use(middleware.auth())
      .use(middleware.roleGuard({ roles: ANALYTICS_ROLES }))
  })
  .prefix('/api/v1')
