/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.refresh': {
    methods: ["POST"]
    pattern: '/api/v1/auth/refresh'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').refreshTokenValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').refreshTokenValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['refresh']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['refresh']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
    }
  }
  'auth.access_token.destroy_all': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout-all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroyAll']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroyAll']>>>
    }
  }
  'auth.access_token.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/tokens'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['index']>>>
    }
  }
  'auth.access_token.revoke': {
    methods: ["DELETE"]
    pattern: '/api/v1/auth/tokens/:tokenId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { tokenId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['revoke']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['revoke']>>>
    }
  }
  'auth.password_reset.forgot': {
    methods: ["POST"]
    pattern: '/api/v1/auth/password/forgot'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['forgot']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['forgot']>>>
    }
  }
  'auth.password_reset.reset': {
    methods: ["POST"]
    pattern: '/api/v1/auth/password/reset'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['reset']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_reset_controller').default['reset']>>>
    }
  }
  'auth.email_verification.send': {
    methods: ["POST"]
    pattern: '/api/v1/auth/email/verification-notification'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_verification_controller').default['send']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_verification_controller').default['send']>>>
    }
  }
  'auth.email_verification.verify': {
    methods: ["POST"]
    pattern: '/api/v1/auth/email/verify'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_verification_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_verification_controller').default['verify']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.profile.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/account/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/account/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').deleteAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').deleteAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['destroy']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard.dashboard.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'dashboard.dashboard.farmer_counts': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard/farmer-counts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['farmerCounts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['farmerCounts']>>>
    }
  }
  'dashboard.dashboard.yield_summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard/yield-summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['yieldSummary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['yieldSummary']>>>
    }
  }
  'dashboard.dashboard.sync_status': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard/sync-status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['syncStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['syncStatus']>>>
    }
  }
  'dashboard.dashboard.health': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dashboard/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['health']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['health']>>>
    }
  }
  'organizations.organizations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/organizations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['index']>>>
    }
  }
  'organizations.organizations.store': {
    methods: ["POST"]
    pattern: '/api/v1/organizations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization').createOrganizationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/organization').createOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'organizations.organizations.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['show']>>>
    }
  }
  'organizations.organizations.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/organizations/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/organization').updateOrganizationValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/organization').updateOrganizationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'organizations.organizations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/organizations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['destroy']>>>
    }
  }
  'organizations.organizations.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/organizations/:id/dashboard'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['dashboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/organizations_controller').default['dashboard']>>>
    }
  }
  'appUsers.app_users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/app-users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['index']>>>
    }
  }
  'appUsers.app_users.store': {
    methods: ["POST"]
    pattern: '/api/v1/app-users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/app_user').createAppUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/app_user').createAppUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'appUsers.app_users.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/app-users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['show']>>>
    }
  }
  'appUsers.app_users.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/app-users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/app_user').updateAppUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/app_user').updateAppUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'appUsers.app_users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/app-users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['destroy']>>>
    }
  }
  'appUsers.app_users.activate': {
    methods: ["PATCH"]
    pattern: '/api/v1/app-users/:id/activate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['activate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['activate']>>>
    }
  }
  'appUsers.app_users.devices': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/app-users/:id/devices'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['devices']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/app_users_controller').default['devices']>>>
    }
  }
  'devices.devices.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/devices'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['index']>>>
    }
  }
  'devices.devices.store': {
    methods: ["POST"]
    pattern: '/api/v1/devices'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/device').createDeviceValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/device').createDeviceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'devices.devices.show_by_uuid': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/devices/by-uuid/:deviceUuid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { deviceUuid: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['showByUuid']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['showByUuid']>>>
    }
  }
  'devices.devices.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/devices/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['show']>>>
    }
  }
  'devices.devices.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/devices/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/device').updateDeviceValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/device').updateDeviceValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'devices.devices.mark_synced': {
    methods: ["PATCH"]
    pattern: '/api/v1/devices/:id/sync'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['markSynced']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['markSynced']>>>
    }
  }
  'devices.devices.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/devices/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/devices_controller').default['destroy']>>>
    }
  }
  'cropTypes.crop_types.categories': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/crop-types/categories'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['categories']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['categories']>>>
    }
  }
  'cropTypes.crop_types.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/crop-types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['index']>>>
    }
  }
  'cropTypes.crop_types.store': {
    methods: ["POST"]
    pattern: '/api/v1/crop-types'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/crop_type').createCropTypeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/crop_type').createCropTypeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cropTypes.crop_types.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/crop-types/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['show']>>>
    }
  }
  'cropTypes.crop_types.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/crop-types/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/crop_type').updateCropTypeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/crop_type').updateCropTypeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'cropTypes.crop_types.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/crop-types/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/crop_types_controller').default['destroy']>>>
    }
  }
  'farmers.farmers.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/farmers/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['stats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['stats']>>>
    }
  }
  'farmers.farmers.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/farmers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['index']>>>
    }
  }
  'farmers.farmers.store': {
    methods: ["POST"]
    pattern: '/api/v1/farmers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/farmer').createFarmerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/farmer').createFarmerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'farmers.farmers.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/farmers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['show']>>>
    }
  }
  'farmers.farmers.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/farmers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/farmer').updateFarmerValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/farmer').updateFarmerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'farmers.farmers.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/farmers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['destroy']>>>
    }
  }
  'farmers.farmers.restore': {
    methods: ["POST"]
    pattern: '/api/v1/farmers/:id/restore'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['restore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['restore']>>>
    }
  }
  'farmers.farmers.plots': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/farmers/:id/plots'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['plots']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/farmers_controller').default['plots']>>>
    }
  }
  'plots.plots.nearby': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/plots/nearby'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['nearby']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['nearby']>>>
    }
  }
  'plots.plots.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/plots'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['index']>>>
    }
  }
  'plots.plots.store': {
    methods: ["POST"]
    pattern: '/api/v1/plots'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/plot').createPlotValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/plot').createPlotValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'plots.plots.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/plots/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['show']>>>
    }
  }
  'plots.plots.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/plots/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/plot').updatePlotValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/plot').updatePlotValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'plots.plots.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/plots/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['destroy']>>>
    }
  }
  'plots.plots.restore': {
    methods: ["POST"]
    pattern: '/api/v1/plots/:id/restore'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['restore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/plots_controller').default['restore']>>>
    }
  }
  'observations.observations.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/observations/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['summary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['summary']>>>
    }
  }
  'observations.observations.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/observations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['index']>>>
    }
  }
  'observations.observations.store': {
    methods: ["POST"]
    pattern: '/api/v1/observations'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/observation').createObservationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/observation').createObservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'observations.observations.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/observations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['show']>>>
    }
  }
  'observations.observations.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/observations/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/observation').updateObservationValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/observation').updateObservationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'observations.observations.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/observations/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['destroy']>>>
    }
  }
  'observations.observations.restore': {
    methods: ["POST"]
    pattern: '/api/v1/observations/:id/restore'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['restore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['restore']>>>
    }
  }
  'observations.observations.record_harvest': {
    methods: ["PATCH"]
    pattern: '/api/v1/observations/:id/harvest'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['recordHarvest']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/observations_controller').default['recordHarvest']>>>
    }
  }
  'observations.attachments.by_observation': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/observations/:observationId/attachments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { observationId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['byObservation']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['byObservation']>>>
    }
  }
  'attachments.attachments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attachments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['index']>>>
    }
  }
  'attachments.attachments.store': {
    methods: ["POST"]
    pattern: '/api/v1/attachments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attachment').createAttachmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/attachment').createAttachmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attachments.attachments.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/attachments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['show']>>>
    }
  }
  'attachments.attachments.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/attachments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/attachment').updateAttachmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/attachment').updateAttachmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'attachments.attachments.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/attachments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/attachments_controller').default['destroy']>>>
    }
  }
  'syncQueue.sync_queue.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/sync-queue/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['stats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['stats']>>>
    }
  }
  'syncQueue.sync_queue.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/sync-queue'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['index']>>>
    }
  }
  'syncQueue.sync_queue.store': {
    methods: ["POST"]
    pattern: '/api/v1/sync-queue'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/sync_queue').createSyncQueueValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/sync_queue').createSyncQueueValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'syncQueue.sync_queue.batch': {
    methods: ["POST"]
    pattern: '/api/v1/sync-queue/batch'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/sync_queue').createSyncQueueValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/sync_queue').createSyncQueueValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['batch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['batch']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'syncQueue.sync_queue.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/sync-queue/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['show']>>>
    }
  }
  'syncQueue.sync_queue.update_status': {
    methods: ["PATCH"]
    pattern: '/api/v1/sync-queue/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/sync_queue').updateSyncQueueStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/sync_queue').updateSyncQueueStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['updateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'syncQueue.sync_queue.retry': {
    methods: ["POST"]
    pattern: '/api/v1/sync-queue/:id/retry'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['retry']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['retry']>>>
    }
  }
  'syncQueue.sync_queue.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/sync-queue/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sync_queue_controller').default['destroy']>>>
    }
  }
  'auditLogs.audit_logs.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/audit-logs/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['stats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['stats']>>>
    }
  }
  'auditLogs.audit_logs.by_record': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/audit-logs/record/:tableName/:recordId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { tableName: ParamValue; recordId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['byRecord']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['byRecord']>>>
    }
  }
  'auditLogs.audit_logs.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/audit-logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['index']>>>
    }
  }
  'auditLogs.audit_logs.store': {
    methods: ["POST"]
    pattern: '/api/v1/audit-logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['store']>>>
    }
  }
  'auditLogs.audit_logs.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/audit-logs/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/audit_logs_controller').default['show']>>>
    }
  }
  'imports.imports.store': {
    methods: ["POST"]
    pattern: '/api/v1/imports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['store']>>>
    }
  }
  'imports.imports.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/imports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['index']>>>
    }
  }
  'imports.imports.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/imports/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['show']>>>
    }
  }
  'imports.imports.schema': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/imports/:id/schema'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['schema']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['schema']>>>
    }
  }
  'imports.imports.records': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/imports/:id/records'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['records']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['records']>>>
    }
  }
  'predictions.predictions.ml_health': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/predictions/ml-health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['mlHealth']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['mlHealth']>>>
    }
  }
  'predictions.predictions.store': {
    methods: ["POST"]
    pattern: '/api/v1/predictions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['store']>>>
    }
  }
  'predictions.predictions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/predictions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['index']>>>
    }
  }
  'predictions.predictions.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/predictions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/predictions_controller').default['show']>>>
    }
  }
  'rag.rag.status': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/rag/status'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rag_controller').default['status']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rag_controller').default['status']>>>
    }
  }
  'rag.rag.query': {
    methods: ["POST"]
    pattern: '/api/v1/rag/query'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/rag_controller').default['query']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/rag_controller').default['query']>>>
    }
  }
  'monetization.monetization.list_products': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/monetization/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['listProducts']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['listProducts']>>>
    }
  }
  'monetization.monetization.store_product': {
    methods: ["POST"]
    pattern: '/api/v1/monetization/products'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['storeProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['storeProduct']>>>
    }
  }
  'monetization.monetization.show_product': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/monetization/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['showProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['showProduct']>>>
    }
  }
  'monetization.monetization.update_product': {
    methods: ["PATCH"]
    pattern: '/api/v1/monetization/products/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['updateProduct']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['updateProduct']>>>
    }
  }
  'monetization.monetization.list_subscriptions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/monetization/subscriptions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['listSubscriptions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['listSubscriptions']>>>
    }
  }
  'monetization.monetization.store_subscription': {
    methods: ["POST"]
    pattern: '/api/v1/monetization/subscriptions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['storeSubscription']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['storeSubscription']>>>
    }
  }
  'monetization.monetization.list_transactions': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/monetization/transactions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['listTransactions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['listTransactions']>>>
    }
  }
  'monetization.monetization.chapa_webhook': {
    methods: ["POST"]
    pattern: '/api/v1/monetization/chapa/webhook'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['chapaWebhook']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/monetization_controller').default['chapaWebhook']>>>
    }
  }
  'importTrends': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/import-trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'yieldTrends': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/analytics/yield-trends'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
