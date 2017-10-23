import uuid from 'uuid'
import * as dbTasks from '../../../dbTasks/resolvers'
import StepFunctions from '../../../../utils/stepFunctions'
import { getRuns } from './flowRuns'

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

export async function getTaskItemById(taskId) {
  const task = await getTaskById(taskId)
  if (!task) {
    return Promise.reject('Task not found.')
  }

  const runs = await getRuns(task.flow, { offset: 0 })
  if (!runs) {
    return Promise.reject('No flow runs available for this task.')
  }

  return Promise.resolve({
    id: taskId,
    data: runs[0].result,
    type: 'html'
  })
}

export function batchGetTasksByIds(tasksIds) {
  return dbTasks.batchGetTasksByIds(tasksIds)
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function updateTask(task) {
  const oldTask = await getTaskById(task.id)

  if (oldTask.state !== task.state) {
    const taskToken = oldTask.taskToken
    switch (task.state) {
      case 'APPROVED': {
        await StepFunctions.sendTaskSuccess({ taskToken, output: JSON.stringify({}) })
        break
      }
      case 'REJECTED': {
        await StepFunctions.sendTaskFailure({ taskToken, cause: 'REJECTED' })
        break
      }
      default:
        console.log('noting to do')
    }
  }

  return dbTasks.updateTask(task)
}

export function deleteTask(id) {
  return getTaskById(id)
    .then(task => StepFunctions.deleteActivity({ activityArn: task.activityArn }))
    .then(() => dbTasks.deleteTask(id))
}
