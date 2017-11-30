import uuid from 'uuid'
import * as dbAccounts from '../../../dbAccounts/resolvers'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allAccounts(userId) {
  return dbAccounts.allAccounts(userId)
}

export function getAccountById(accountId, userId) {
  return dbAccounts.getAccountById(accountId, userId)
}

