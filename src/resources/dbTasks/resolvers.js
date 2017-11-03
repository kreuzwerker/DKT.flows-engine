import dynDB from '../../utils/dynamoDB'

export function allTasks(userId) {
  // Retrieves all unfinished tasks
  const table = process.env.DYNAMO_TASKS
  const params = {
    FilterExpression: '#state IN (:not_started, :started, :paused) AND #userId = :userId',
    ExpressionAttributeNames: {
      '#state': 'state',
      '#userId': 'userId'
    },
    ExpressionAttributeValues: {
      ':not_started': 'NOT_STARTED',
      ':started': 'STARTED',
      ':paused': 'PAUSED',
      ':userId': userId
    }
  }

  return dynDB.scan(table, params).then(r => r.Items)
}

export function getTaskById(taskId, userId) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: taskId }
  }

  return dynDB.getItem(table, query).then((r) => {
    const item = r.Item || {}
    return item.userId === userId || item.userId === null ? item : null
  })
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
