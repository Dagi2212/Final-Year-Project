/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      refresh: typeof routes['auth.access_token.refresh']
      destroy: typeof routes['auth.access_token.destroy']
      destroyAll: typeof routes['auth.access_token.destroy_all']
      index: typeof routes['auth.access_token.index']
      revoke: typeof routes['auth.access_token.revoke']
    }
    passwordReset: {
      forgot: typeof routes['auth.password_reset.forgot']
      reset: typeof routes['auth.password_reset.reset']
    }
    emailVerification: {
      send: typeof routes['auth.email_verification.send']
      verify: typeof routes['auth.email_verification.verify']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
      update: typeof routes['profile.profile.update']
      destroy: typeof routes['profile.profile.destroy']
    }
  }
  dashboard: {
    dashboard: {
      index: typeof routes['dashboard.dashboard.index']
      farmerCounts: typeof routes['dashboard.dashboard.farmer_counts']
      yieldSummary: typeof routes['dashboard.dashboard.yield_summary']
      syncStatus: typeof routes['dashboard.dashboard.sync_status']
      health: typeof routes['dashboard.dashboard.health']
    }
  }
  organizations: {
    organizations: {
      index: typeof routes['organizations.organizations.index']
      store: typeof routes['organizations.organizations.store']
      show: typeof routes['organizations.organizations.show']
      update: typeof routes['organizations.organizations.update']
      destroy: typeof routes['organizations.organizations.destroy']
      dashboard: typeof routes['organizations.organizations.dashboard']
    }
  }
  appUsers: {
    appUsers: {
      index: typeof routes['appUsers.app_users.index']
      store: typeof routes['appUsers.app_users.store']
      show: typeof routes['appUsers.app_users.show']
      update: typeof routes['appUsers.app_users.update']
      destroy: typeof routes['appUsers.app_users.destroy']
      activate: typeof routes['appUsers.app_users.activate']
      devices: typeof routes['appUsers.app_users.devices']
    }
  }
  devices: {
    devices: {
      index: typeof routes['devices.devices.index']
      store: typeof routes['devices.devices.store']
      showByUuid: typeof routes['devices.devices.show_by_uuid']
      show: typeof routes['devices.devices.show']
      update: typeof routes['devices.devices.update']
      markSynced: typeof routes['devices.devices.mark_synced']
      destroy: typeof routes['devices.devices.destroy']
    }
  }
  cropTypes: {
    cropTypes: {
      categories: typeof routes['cropTypes.crop_types.categories']
      index: typeof routes['cropTypes.crop_types.index']
      store: typeof routes['cropTypes.crop_types.store']
      show: typeof routes['cropTypes.crop_types.show']
      update: typeof routes['cropTypes.crop_types.update']
      destroy: typeof routes['cropTypes.crop_types.destroy']
    }
  }
  farmers: {
    farmers: {
      stats: typeof routes['farmers.farmers.stats']
      index: typeof routes['farmers.farmers.index']
      store: typeof routes['farmers.farmers.store']
      show: typeof routes['farmers.farmers.show']
      update: typeof routes['farmers.farmers.update']
      destroy: typeof routes['farmers.farmers.destroy']
      restore: typeof routes['farmers.farmers.restore']
      plots: typeof routes['farmers.farmers.plots']
    }
  }
  plots: {
    plots: {
      nearby: typeof routes['plots.plots.nearby']
      index: typeof routes['plots.plots.index']
      store: typeof routes['plots.plots.store']
      show: typeof routes['plots.plots.show']
      update: typeof routes['plots.plots.update']
      destroy: typeof routes['plots.plots.destroy']
      restore: typeof routes['plots.plots.restore']
    }
  }
  observations: {
    observations: {
      summary: typeof routes['observations.observations.summary']
      index: typeof routes['observations.observations.index']
      store: typeof routes['observations.observations.store']
      show: typeof routes['observations.observations.show']
      update: typeof routes['observations.observations.update']
      destroy: typeof routes['observations.observations.destroy']
      restore: typeof routes['observations.observations.restore']
      recordHarvest: typeof routes['observations.observations.record_harvest']
    }
    attachments: {
      byObservation: typeof routes['observations.attachments.by_observation']
    }
  }
  attachments: {
    attachments: {
      index: typeof routes['attachments.attachments.index']
      store: typeof routes['attachments.attachments.store']
      show: typeof routes['attachments.attachments.show']
      update: typeof routes['attachments.attachments.update']
      destroy: typeof routes['attachments.attachments.destroy']
    }
  }
  syncQueue: {
    syncQueue: {
      stats: typeof routes['syncQueue.sync_queue.stats']
      index: typeof routes['syncQueue.sync_queue.index']
      store: typeof routes['syncQueue.sync_queue.store']
      batch: typeof routes['syncQueue.sync_queue.batch']
      show: typeof routes['syncQueue.sync_queue.show']
      updateStatus: typeof routes['syncQueue.sync_queue.update_status']
      retry: typeof routes['syncQueue.sync_queue.retry']
      destroy: typeof routes['syncQueue.sync_queue.destroy']
    }
  }
  auditLogs: {
    auditLogs: {
      stats: typeof routes['auditLogs.audit_logs.stats']
      byRecord: typeof routes['auditLogs.audit_logs.by_record']
      index: typeof routes['auditLogs.audit_logs.index']
      store: typeof routes['auditLogs.audit_logs.store']
      show: typeof routes['auditLogs.audit_logs.show']
    }
  }
  imports: {
    imports: {
      store: typeof routes['imports.imports.store']
      index: typeof routes['imports.imports.index']
      show: typeof routes['imports.imports.show']
      schema: typeof routes['imports.imports.schema']
      records: typeof routes['imports.imports.records']
    }
  }
  predictions: {
    predictions: {
      mlHealth: typeof routes['predictions.predictions.ml_health']
      store: typeof routes['predictions.predictions.store']
      index: typeof routes['predictions.predictions.index']
      show: typeof routes['predictions.predictions.show']
    }
  }
  rag: {
    rag: {
      status: typeof routes['rag.rag.status']
      query: typeof routes['rag.rag.query']
    }
  }
  monetization: {
    monetization: {
      listProducts: typeof routes['monetization.monetization.list_products']
      storeProduct: typeof routes['monetization.monetization.store_product']
      showProduct: typeof routes['monetization.monetization.show_product']
      updateProduct: typeof routes['monetization.monetization.update_product']
      listSubscriptions: typeof routes['monetization.monetization.list_subscriptions']
      storeSubscription: typeof routes['monetization.monetization.store_subscription']
      listTransactions: typeof routes['monetization.monetization.list_transactions']
      chapaWebhook: typeof routes['monetization.monetization.chapa_webhook']
    }
  }
  importTrends: typeof routes['importTrends']
  yieldTrends: typeof routes['yieldTrends']
}
