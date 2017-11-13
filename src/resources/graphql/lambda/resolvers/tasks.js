import * as dbTasks from '../../../dbTasks/resolvers'
import { StepFunctions } from '../../../../utils/aws'
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

  // Retrieve the preceding step to this task so the client can determine the
  // task item's content type via prevStep.service
  let lastRun = runs[0],
      prevStep = null
  if (parseInt(lastRun.currentStep.position, 10) > 0) {
    const prevStepPos = parseInt(lastRun.currentStep.position, 10) - 1
    prevStep = task.flowRun.flow.steps.find(step => parseInt(step.position, 10) === prevStepPos)
  }

  return Promise.resolve({
    id: taskId,
    data: lastRun.result,
    prevStep: prevStep
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
