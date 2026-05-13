import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.refresh': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy_all': { paramsTuple?: []; params?: {} }
    'auth.access_token.index': { paramsTuple?: []; params?: {} }
    'auth.access_token.revoke': { paramsTuple: [ParamValue]; params: {'tokenId': ParamValue} }
    'auth.password_reset.forgot': { paramsTuple?: []; params?: {} }
    'auth.password_reset.reset': { paramsTuple?: []; params?: {} }
    'auth.email_verification.send': { paramsTuple?: []; params?: {} }
    'auth.email_verification.verify': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.update': { paramsTuple?: []; params?: {} }
    'profile.profile.destroy': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.farmer_counts': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.yield_summary': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.sync_status': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.health': { paramsTuple?: []; params?: {} }
    'organizations.organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.organizations.store': { paramsTuple?: []; params?: {} }
    'organizations.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.organizations.dashboard': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.index': { paramsTuple?: []; params?: {} }
    'appUsers.app_users.store': { paramsTuple?: []; params?: {} }
    'appUsers.app_users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.activate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.devices': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.index': { paramsTuple?: []; params?: {} }
    'devices.devices.store': { paramsTuple?: []; params?: {} }
    'devices.devices.show_by_uuid': { paramsTuple: [ParamValue]; params: {'deviceUuid': ParamValue} }
    'devices.devices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.mark_synced': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.categories': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.index': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.store': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.stats': { paramsTuple?: []; params?: {} }
    'farmers.farmers.index': { paramsTuple?: []; params?: {} }
    'farmers.farmers.store': { paramsTuple?: []; params?: {} }
    'farmers.farmers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.plots': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.nearby': { paramsTuple?: []; params?: {} }
    'plots.plots.index': { paramsTuple?: []; params?: {} }
    'plots.plots.store': { paramsTuple?: []; params?: {} }
    'plots.plots.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.summary': { paramsTuple?: []; params?: {} }
    'observations.observations.index': { paramsTuple?: []; params?: {} }
    'observations.observations.store': { paramsTuple?: []; params?: {} }
    'observations.observations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.record_harvest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.attachments.by_observation': { paramsTuple: [ParamValue]; params: {'observationId': ParamValue} }
    'attachments.attachments.index': { paramsTuple?: []; params?: {} }
    'attachments.attachments.store': { paramsTuple?: []; params?: {} }
    'attachments.attachments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'attachments.attachments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'attachments.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.stats': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.index': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.store': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.batch': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.retry': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auditLogs.audit_logs.stats': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.by_record': { paramsTuple: [ParamValue,ParamValue]; params: {'tableName': ParamValue,'recordId': ParamValue} }
    'auditLogs.audit_logs.index': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.store': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.store': { paramsTuple?: []; params?: {} }
    'imports.imports.index': { paramsTuple?: []; params?: {} }
    'imports.imports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.schema': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.records': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'predictions.predictions.ml_health': { paramsTuple?: []; params?: {} }
    'predictions.predictions.store': { paramsTuple?: []; params?: {} }
    'predictions.predictions.index': { paramsTuple?: []; params?: {} }
    'predictions.predictions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rag.rag.status': { paramsTuple?: []; params?: {} }
    'rag.rag.query': { paramsTuple?: []; params?: {} }
    'monetization.monetization.list_products': { paramsTuple?: []; params?: {} }
    'monetization.monetization.store_product': { paramsTuple?: []; params?: {} }
    'monetization.monetization.show_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'monetization.monetization.update_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'monetization.monetization.list_subscriptions': { paramsTuple?: []; params?: {} }
    'monetization.monetization.store_subscription': { paramsTuple?: []; params?: {} }
    'monetization.monetization.list_transactions': { paramsTuple?: []; params?: {} }
    'monetization.monetization.chapa_webhook': { paramsTuple?: []; params?: {} }
    'importTrends': { paramsTuple?: []; params?: {} }
    'yieldTrends': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.access_token.index': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.farmer_counts': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.yield_summary': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.sync_status': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.health': { paramsTuple?: []; params?: {} }
    'organizations.organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.organizations.dashboard': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.index': { paramsTuple?: []; params?: {} }
    'appUsers.app_users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.devices': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.index': { paramsTuple?: []; params?: {} }
    'devices.devices.show_by_uuid': { paramsTuple: [ParamValue]; params: {'deviceUuid': ParamValue} }
    'devices.devices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.categories': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.index': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.stats': { paramsTuple?: []; params?: {} }
    'farmers.farmers.index': { paramsTuple?: []; params?: {} }
    'farmers.farmers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.plots': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.nearby': { paramsTuple?: []; params?: {} }
    'plots.plots.index': { paramsTuple?: []; params?: {} }
    'plots.plots.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.summary': { paramsTuple?: []; params?: {} }
    'observations.observations.index': { paramsTuple?: []; params?: {} }
    'observations.observations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.attachments.by_observation': { paramsTuple: [ParamValue]; params: {'observationId': ParamValue} }
    'attachments.attachments.index': { paramsTuple?: []; params?: {} }
    'attachments.attachments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.stats': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.index': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auditLogs.audit_logs.stats': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.by_record': { paramsTuple: [ParamValue,ParamValue]; params: {'tableName': ParamValue,'recordId': ParamValue} }
    'auditLogs.audit_logs.index': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.index': { paramsTuple?: []; params?: {} }
    'imports.imports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.schema': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.records': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'predictions.predictions.ml_health': { paramsTuple?: []; params?: {} }
    'predictions.predictions.index': { paramsTuple?: []; params?: {} }
    'predictions.predictions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rag.rag.status': { paramsTuple?: []; params?: {} }
    'monetization.monetization.list_products': { paramsTuple?: []; params?: {} }
    'monetization.monetization.show_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'monetization.monetization.list_subscriptions': { paramsTuple?: []; params?: {} }
    'monetization.monetization.list_transactions': { paramsTuple?: []; params?: {} }
    'importTrends': { paramsTuple?: []; params?: {} }
    'yieldTrends': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.access_token.index': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.index': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.farmer_counts': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.yield_summary': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.sync_status': { paramsTuple?: []; params?: {} }
    'dashboard.dashboard.health': { paramsTuple?: []; params?: {} }
    'organizations.organizations.index': { paramsTuple?: []; params?: {} }
    'organizations.organizations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'organizations.organizations.dashboard': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.index': { paramsTuple?: []; params?: {} }
    'appUsers.app_users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.devices': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.index': { paramsTuple?: []; params?: {} }
    'devices.devices.show_by_uuid': { paramsTuple: [ParamValue]; params: {'deviceUuid': ParamValue} }
    'devices.devices.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.categories': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.index': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.stats': { paramsTuple?: []; params?: {} }
    'farmers.farmers.index': { paramsTuple?: []; params?: {} }
    'farmers.farmers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.plots': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.nearby': { paramsTuple?: []; params?: {} }
    'plots.plots.index': { paramsTuple?: []; params?: {} }
    'plots.plots.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.summary': { paramsTuple?: []; params?: {} }
    'observations.observations.index': { paramsTuple?: []; params?: {} }
    'observations.observations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.attachments.by_observation': { paramsTuple: [ParamValue]; params: {'observationId': ParamValue} }
    'attachments.attachments.index': { paramsTuple?: []; params?: {} }
    'attachments.attachments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.stats': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.index': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auditLogs.audit_logs.stats': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.by_record': { paramsTuple: [ParamValue,ParamValue]; params: {'tableName': ParamValue,'recordId': ParamValue} }
    'auditLogs.audit_logs.index': { paramsTuple?: []; params?: {} }
    'auditLogs.audit_logs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.index': { paramsTuple?: []; params?: {} }
    'imports.imports.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.schema': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.imports.records': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'predictions.predictions.ml_health': { paramsTuple?: []; params?: {} }
    'predictions.predictions.index': { paramsTuple?: []; params?: {} }
    'predictions.predictions.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'rag.rag.status': { paramsTuple?: []; params?: {} }
    'monetization.monetization.list_products': { paramsTuple?: []; params?: {} }
    'monetization.monetization.show_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'monetization.monetization.list_subscriptions': { paramsTuple?: []; params?: {} }
    'monetization.monetization.list_transactions': { paramsTuple?: []; params?: {} }
    'importTrends': { paramsTuple?: []; params?: {} }
    'yieldTrends': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.refresh': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy_all': { paramsTuple?: []; params?: {} }
    'auth.password_reset.forgot': { paramsTuple?: []; params?: {} }
    'auth.password_reset.reset': { paramsTuple?: []; params?: {} }
    'auth.email_verification.send': { paramsTuple?: []; params?: {} }
    'auth.email_verification.verify': { paramsTuple?: []; params?: {} }
    'organizations.organizations.store': { paramsTuple?: []; params?: {} }
    'appUsers.app_users.store': { paramsTuple?: []; params?: {} }
    'devices.devices.store': { paramsTuple?: []; params?: {} }
    'cropTypes.crop_types.store': { paramsTuple?: []; params?: {} }
    'farmers.farmers.store': { paramsTuple?: []; params?: {} }
    'farmers.farmers.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.store': { paramsTuple?: []; params?: {} }
    'plots.plots.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.store': { paramsTuple?: []; params?: {} }
    'observations.observations.restore': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'attachments.attachments.store': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.store': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.batch': { paramsTuple?: []; params?: {} }
    'syncQueue.sync_queue.retry': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'auditLogs.audit_logs.store': { paramsTuple?: []; params?: {} }
    'imports.imports.store': { paramsTuple?: []; params?: {} }
    'predictions.predictions.store': { paramsTuple?: []; params?: {} }
    'rag.rag.query': { paramsTuple?: []; params?: {} }
    'monetization.monetization.store_product': { paramsTuple?: []; params?: {} }
    'monetization.monetization.store_subscription': { paramsTuple?: []; params?: {} }
    'monetization.monetization.chapa_webhook': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'auth.access_token.revoke': { paramsTuple: [ParamValue]; params: {'tokenId': ParamValue} }
    'profile.profile.destroy': { paramsTuple?: []; params?: {} }
    'organizations.organizations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'attachments.attachments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'profile.profile.update': { paramsTuple?: []; params?: {} }
    'organizations.organizations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'appUsers.app_users.activate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'devices.devices.mark_synced': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cropTypes.crop_types.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'farmers.farmers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'plots.plots.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'observations.observations.record_harvest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'attachments.attachments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'syncQueue.sync_queue.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'monetization.monetization.update_product': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}