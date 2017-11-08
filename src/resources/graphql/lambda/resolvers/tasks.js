import * as dbTasks from '../../../dbTasks/resolvers'
import StepFunctions from '../../../../utils/stepFunctions'
import { getRuns } from './flowRuns'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allTasks(userId) {
  return dbTasks.allTasks(userId)
}

export function getTaskById(taskId, userId) {
  return dbTasks.getTaskById(taskId, userId)
}

export async function getTaskItemById(taskId, userId) {
  const task = await getTaskById(taskId, userId)
  if (!task) {
    return Promise.reject('Task not found.')
  }

  const runs = await getRuns(task.flowRun, { offset: 0 })
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
export async function updateTask(task, userId) {
  const oldTask = await getTaskById(task.id, userId)

  if (oldTask.state !== task.state) {
    const taskToken = oldTask.taskToken
    switch (task.state) {
      case 'APPROVED': {
        await StepFunctions.sendTaskSuccess({
          taskToken,
          output: JSON.stringify({ message: 'success' })
        })
        break
      }
      case 'REJECTED': {
        await StepFunctions.sendTaskSuccess({
          taskToken,
          output: JSON.stringify({ message: 'rejected' })
        })
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
