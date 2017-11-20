import dynDB from '../../utils/dynamoDB'

export function allTasks() {
  // Retrieves all unfinished tasks
  const table = process.env.DYNAMO_TASKS
  const params = {
    FilterExpression: '#state IN (:not_started, :started, :paused)',
    ExpressionAttributeNames: {
      '#state': 'state'
    },
    ExpressionAttributeValues: {
      ':not_started': 'NOT_STARTED',
      ':started': 'STARTED',
      ':paused': 'PAUSED'
    }
  }
  return dynDB.scan(table, params).then(r => r.Items)
}

export function getTaskById(taskId) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: taskId }
  }

  return dynDB.getItem(table, query).then(r => r.Item || null)
}

export function batchGetTasksByIds(tasksIds) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    RequestItems: {
      [table]: {
        Keys: tasksIds.map(id => ({ id }))
      }
    }
  }

  return dynDB.batchGetItem(query).then(res => res.Responses[table])
}

export function createTask(task) {
  const table = process.env.DYNAMO_TASKS
  return dynDB.putItem(table, task)
}

export function updateTask(task) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: task.id }
  }

  return dynDB.updateItem(table, query, task)
}

export function deleteTask(id) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id }
  }
  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
