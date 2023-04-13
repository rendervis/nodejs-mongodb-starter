export const ENV_SCOPED_PERMISSIONS = ['publishFeatures', 'manageEnvironments'] as const

export const PROJECT_SCOPED_PERMISSIONS = ['addComments', 'createFeatureDrafts', 'manageFeatures', 'runQueries'] as const

export const GLOBAL_PERMISSIONS = ['superDelete', 'manageWebhooks', 'manageBilling', 'viewEvents'] as const

export const ALL_PERMISSIONS = [...GLOBAL_PERMISSIONS, ...PROJECT_SCOPED_PERMISSIONS, ...ENV_SCOPED_PERMISSIONS]
