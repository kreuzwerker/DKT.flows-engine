import { unmarshalItem } from 'dynamodb-marshaler'
import dDB from '../../../utils/dynamoDB'


/*
 * ---- Root resolvers ---------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const Query = {
  allFlows: () => {
    const table = process.env.DYNAMO_FLOWS
    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  flow: (_, { id }) => {
    const table = process.env.DYNAMO_FLOWS
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  },

  allProviders: () => {
    const table = process.env.DYNAMO_PROVIDERS
    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  provider: (_, { id }) => {
    const table = process.env.DYNAMO_PROVIDERS
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  },


  allServices: () => {
    const table = process.env.DYNAMO_SERVICES
    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  service: (_, { id }) => {
    const table = process.env.DYNAMO_SERVICES
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  },


  allSteps: () => {
    const table = process.env.DYNAMO_STEPS

    return dDB.scan(table)
              .then(r => r.Items.map(unmarshalItem))
  },

  step: (_, { id }) => {
    const table = process.env.DYNAMO_STEPS
    const query = { Key: { id: { S: id } } }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  }
}


/*
 * ---- Field resolvers --------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export const flow = {
  steps: (instance) => {
    if (!instance.steps) return []

    const table = process.env.DYNAMO_STEPS
    const query = {
      RequestItems: {
        [table]: {
          Keys: instance.steps.map(id => ({ id: { S: id } }))
        }
      }
    }

    return dDB.batchGetItem(query)
              .then(res => res.Responses[table].map(unmarshalItem))
  }
}


export const provider = {
  services: (instance) => {
    if (!instance.services) return []

    const table = process.env.DYNAMO_SERVICES
    const query = {
      RequestItems: {
        [table]: {
          Keys: instance.services.map(id => ({ id: { S: id } }))
        }
      }
    }

    return dDB.batchGetItem(query)
              .then(res => res.Responses[table].map(unmarshalItem))
  }
}


export const service = {
  provider: (instance) => {
    if (!instance.provider) return null

    const table = process.env.DYNAMO_PROVIDERS
    const params = {
      Key: { id: { S: instance.provider } }
    }

    return dDB.getItem(table, params)
              .then(r => unmarshalItem(r.Item))
  },

  step: (instance) => {
    if (!instance.step) return null

    const table = process.env.DYNAMO_STEPS
    const params = {
      Key: { id: { S: instance.step } }
    }

    return dDB.getItem(table, params)
              .then(r => unmarshalItem(r.Item))
  }
}


export const step = {
  flow: (instance) => {
    if (!instance.flow) return null

    const table = process.env.DYNAMO_FLOWS
    const query = {
      Key: { id: { S: instance.flow } }
    }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  },

  service: (instance) => {
    if (!instance.service) return null

    const table = process.env.DYNAMO_SERVICES
    const query = {
      Key: { id: { S: instance.service } }
    }

    return dDB.getItem(table, query)
              .then(r => unmarshalItem(r.Item))
  }
}
