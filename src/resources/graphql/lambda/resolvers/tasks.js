import uuid from 'uuid'
import * as dbTasks from '../../../dbTasks/resolvers'
import StepFunctions from '../../../../utils/stepFunctions'

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
        await StepFunctions.sendTaskFailure({ taskToken, output: JSON.stringify({}) })
        break
      }
      default:
        console.log('noting to do')
    }
  }

  return dbTasks.updateTask(task)
}

export async function deleteTask(id) {
  const task = await getTaskById(id)
  if (task.step !== 'REJECTED' && task.step !== 'APPROVED') {
    await StepFunctions.sendTaskFailure({ taskToken: task.taskToken, output: JSON.stringify({}) })
  }
  console.log(task)
  return true
}
