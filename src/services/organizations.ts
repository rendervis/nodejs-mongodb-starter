import { APP_ORIGIN } from '../util/secrets'
import { AuthRequest } from '../types/AuthRequest'
import { UserModel } from '../models/UserModel'

import { SSOConnectionInterface } from '../../types/sso-connection'

export function validateLoginMethod(req: AuthRequest) {
  return true
}

export function getOrgFromReq(req: AuthRequest) {
  if (!req.userId || !req.email) {
    throw new Error('Must be logged in')
  }

  return {
    userId: req.userId,
    email: req.email,
    userName: req.name || ''
  }
}

export async function userHasAccess(req: AuthRequest): Promise<boolean> {
  if (!req.userId) return false

  return true
}

export function getInviteUrl(key: string) {
  return `${APP_ORIGIN}/invitation?key=${key}`
}

function validateId(id: string) {
  if (!id.match(/^[a-zA-Z_][a-zA-Z0-9_-]*$/)) {
    throw new Error('Invalid id (must be only alphanumeric plus underscores and hyphens)')
  }
}

export async function getEmailFromUserId(userId: string) {
  const u = await UserModel.findOne({ id: userId })
  return u?.email || ''
}

export function isEnterpriseSSO(connection?: SSOConnectionInterface) {
  if (!connection) return false

  // On cloud, the default SSO (Auth0) does not have a connection id
  if (!connection.id) return false

  return true
}
