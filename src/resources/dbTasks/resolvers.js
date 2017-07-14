import { unmarshalItem } from 'dynamodb-marshaler'
import dynDB from '../../utils/dynamoDB'

export function allTasks() {
  const table = process.env.DYNAMO_TASKS
  return dynDB.scan(table).then(r => r.Items.map(unmarshalItem))
}

export function getTaskById(taskId) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: { S: taskId } }
  }

  return dynDB.getItem(table, query).then(r => (r.Item ? unmarshalItem(r.Item) : null))
}

export function batchGetTasksByIds(tasksIds) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    RequestItems: {
      [table]: {
        Keys: tasksIds.map(id => ({ id: { S: id } }))
      }
    }
  }

  return dynDB.batchGetItem(query).then(res => res.Responses[table].map(unmarshalItem))
}

export function createTask(task) {
  const table = process.env.DYNAMO_TASKS
  return dynDB.putItem(table, task)
}

export function updateTask(task) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: { S: task.id } }
  }

  return dynDB.updateItem(table, query, task)
}

export function deleteTask(id) {
  const table = process.env.DYNAMO_TASKS
  const query = {
    Key: { id: { S: id } }
  }
  return dynDB.deleteItem(table, query).then(() => ({ id }))
}
