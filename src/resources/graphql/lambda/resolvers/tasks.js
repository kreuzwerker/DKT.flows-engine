import * as dbTasks from '../../../dbTasks/resolvers'
import { S3, StepFunctions } from '../../../../utils/aws'
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

export async function queryTaskItem(taskId, userId) {
  const bucket = process.env.S3_BUCKET
  const s3 = S3(bucket)

  return getTaskById(taskId)
    .then((task) => {
      if (!task.id) {
        return Promise.reject(new Error('E404_TASK_NOT_FOUND'))
      } else if (task.userId !== userId) {
        return Promise.reject(new Error('E401_TASK_ACCESS_DENIED'))
      }

      const taskInput = JSON.parse(task.input)
      const dataKey = taskInput.key

      return s3.getObject({ Key: dataKey }).then(data => ({ data, task, taskInput }))
    })
    .then(({ data, task, taskInput }) => {
      const taskData = JSON.parse(data.Body)
      const prevStepPosition = parseInt(task.currentStep, 10) - 1
      const prevStep = task.flowRun.flow.steps.find(step => parseInt(step.position, 10) === prevStepPosition)

      return Promise.resolve({
        id: taskId,
        data: JSON.stringify(taskData[taskInput.contentKey]),
        prevStep
      })
    })
}

export function batchGetTasksByIds(tasksIds) {
  return dbTasks.batchGetTasksByIds(tasksIds)
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function deleteTask(id, deleteActivity = true) {
  return getTaskById(id)
    .then(task =>
      (deleteActivity
        ? StepFunctions.deleteActivity({ activityArn: task.activityArn })
        : Promise.resolve()))
    .then(() => dbTasks.deleteTask(id))
}

// TODO the removing of a task after finishing is just a temporary functionallity.
// At the Moment it is not possible to see finished tasks in the Frontent.
// So there is no sense in keeping it in the Prototype
export async function updateTask(task, userId) {
  const oldTask = await getTaskById(task.id, userId)

  if (oldTask.state !== task.state) {
    const { taskToken } = oldTask
    switch (task.state) {
      case 'MODIFIED':
      case 'REVIEWED':
      case 'APPROVED': {
        return StepFunctions.sendTaskSuccess({
          taskToken,
          output: JSON.stringify({ message: 'success' })
        })
          .then(() => deleteTask(task.id, false)) // NOTE TEMPORARY
          .then(() => ({ id: task.id }))
      }
      case 'REJECTED': {
        return StepFunctions.sendTaskSuccess({
          taskToken,
          output: JSON.stringify({ message: 'rejected' })
        })
          .then(() => deleteTask(task.id, false)) // NOTE TEMPORARY
          .then(() => ({ id: task.id }))
      }
      default:
        console.log('noting to do')
    }
  }

  return dbTasks.updateTask(task)
}
