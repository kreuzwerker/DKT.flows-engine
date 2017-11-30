import uuid from 'uuid'
import { SSM } from '../../../../utils/aws'
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

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function createAccount(account, userId) {
  const id = uuid.v4()

  return SSM.putParameter({
    Name: id,
    Value: JSON.stringify(account.credentials)
  }).then(() => {
    delete account.credentials
    return dbAccounts.createAccount({
      ...account,
      userId,
      id,
      key: `${id}_parameter`
    })
  })
}

export async function updateAccount(account, userId) {
  return getAccountById(account.id, userId).then((oldAccount) => {
    if (!oldAccount) {
      return Promise.reject(new Error('E401_NOT_ALLOWED'))
    }

    const credentials = account.credentials || null
    delete account.credentials

    return dbAccounts.updateAccount(account).then((res) => {
      if (!credentials) {
        return res
      }

      return SSM.putParameter({
        Name: account.id,
        Value: JSON.stringify(credentials),
        Overwrite: true
      }).then(() => res)
    })
  })
}

export function deleteAccount(id, userId) {
  return getAccountById(id, userId).then((oldAccount) => {
    if (!oldAccount) {
      return Promise.reject(new Error('E401_NOT_ALLOWED'))
    }

    return SSM.deleteParameter({
      Name: id
    }).then(() => dbAccounts.deleteAccount(id).then(() => ({ id })))
  })
}
