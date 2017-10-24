import uuid from 'uuid'
import _sortBy from 'lodash/sortBy'
import { createStep, deleteStep, batchGetStepByIds } from './steps'
import * as dbFlows from '../../../dbFlows/resolvers'
import * as dbFlowRuns from '../../../dbFlowRuns/resolvers'
import * as dbSteps from '../../../dbSteps/resolvers'

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

export async function restoreFlow(id) {
  // Restore flow steps from previous model stored in flowRun
  const [flow, flowRun] = await Promise.all([getFlowById(id), dbFlowRuns.getLastFlowRunByFlowId(id)])
  if (!flowRun) {
    return Promise.reject('No previous flow run found.')
  }

  // Delete all current flow steps
  await Promise.all(flow.steps.map(id => deleteStep(id)))

  // Restore all steps from the previous flow
  await Promise.all(
    flowRun.flow.steps.map(step =>
      dbSteps.createStep(
        Object.assign({}, step, {
          service: step.service.id,
          flow: step.flow
        })
      )
    )
  )

  // Restore old flow steps relations and take flow out of draft state
  return dbFlows.updateFlow(
    Object.assign({}, flow, {
      steps: flowRun.flow.steps.map(step => step.id),
      draft: false
    })
  )
}

export function deleteFlow(id) {
  return getFlowById(id)
    .then(flow => Promise.all(flow.steps.map(stepId => deleteStep(stepId))))
    .then(() => dbFlows.deleteFlow(id))
    .then(res => ({ id }))
}

export async function setFlowDraftState(flow, state) {
  return dbFlows.updateFlow({
    id: flow.id,
    draft: state
  })
}

export async function generateFlowStepsPositions(flow, newStep) {
  let steps = await batchGetStepByIds(flow.steps)
  steps = _sortBy(steps, 'position')

  // Find steps that need to be updated because their position is equal or higher
  // than the given new step
  let updateSteps = [], pos = newStep.position
  updateSteps = steps
    .filter(step => step.id !== newStep.id && step.position >= newStep.position)
    .map((step) => {
      pos++
      step.position = pos
      return step 
    })

  return Promise.all(updateSteps.map(step => dbSteps.updateStep(step)))
}
