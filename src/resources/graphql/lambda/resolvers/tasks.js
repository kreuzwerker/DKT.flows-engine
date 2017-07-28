import uuid from 'uuid'
import * as dbTasks from '../../../dbTasks/resolvers'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allTasks() {
  return dbTasks.allTasks()
}

export function getTaskById(taskId) {
  return dbTasks.getTaskById(taskId)
}

export function batchGetTasksByIds(tasksIds) {
  return dbTasks.batchGetTasksByIds(tasksIds)
}
