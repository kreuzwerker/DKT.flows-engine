import { DynamoDB } from '../../utils/aws'

// TODO we should paginate this!
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

  const tasks = []

  function scan(args) {
    return DynamoDB.scan(table, args).then(({ Items, LastEvaluatedKey }) => {
      Items.forEach(item => tasks.push(item))
      if (LastEvaluatedKey) {
        // scan the next set
        return scan({ ...params, ExclusiveStartKey: LastEvaluatedKey })
      }

      return Promise.resolve()
    })
  }

  return scan(params).then(() => tasks)
}

export function getTaskById(taskId, userId) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: taskId }
  }

  return DynamoDB.getItem(table, query).then((r) => {
    const item = r.Item || {}
    return typeof userId === 'undefined' || item.userId === userId || item.userId === null
      ? item
      : null
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

  return DynamoDB.batchGetItem(query).then(res => res.Responses[table])
}

export function createTask(task) {
  const table = process.env.DYNAMO_TASKS
  return DynamoDB.putItem(table, task)
}

export function updateTask(task) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: task.id }
  }

  return DynamoDB.updateItem(table, query, task)
}

export function deleteTask(id) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id }
  }
  return DynamoDB.deleteItem(table, query).then(() => ({ id }))
}
