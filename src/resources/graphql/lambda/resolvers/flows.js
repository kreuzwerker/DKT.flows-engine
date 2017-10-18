import uuid from 'uuid'
import { createStep, deleteStep, restoreStep } from './steps'
import * as dbFlows from '../../../dbFlows/resolvers'
import * as dbFlowRuns from '../../../dbFlowRuns/resolvers'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allFlows() {
  return dbFlows.allFlows()
}

export function getFlowById(flowId) {
  return dbFlows.getFlowById(flowId)
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlow(flow) {
  let newFlow = Object.assign(
    {},
    {
      id: uuid.v4(),
      name: null,
      description: null,
      draft: true,
      steps: []
    },
    flow
  )

  try {
    if (newFlow.steps.length === 0) {
      const newStep = await createStep({ flow: newFlow.id })
      newFlow = Object.assign({}, newFlow, { steps: [newStep.id] })
    }

    return dbFlows.createFlow(newFlow)
  } catch (err) {
    return Promise.reject(err)
  }
}

export function updateFlow(flow) {
  return dbFlows.updateFlow(flow).then(flow => setFlowDraftState(flow, true))
}

export function deleteFlow(id) {
  return getFlowById(id)
    .then(flow => Promise.all(flow.steps.map(stepId => deleteStep(stepId))))
    .then(() => dbFlows.deleteFlow(id))
    .then(() => ({ id }))
}

export async function setFlowDraftState(flow, state) {
  return dbFlows.updateFlow({
    id: flow.id,
    draft: state
  });
}
