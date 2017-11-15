import uuid from 'uuid'
import _sortBy from 'lodash/sortBy'
import { createStep, deleteStep, batchGetStepByIds } from './steps'
import { getFlowRunsByFlowId, updateFlowRun } from './flowRuns'
import * as dbFlows from '../../../dbFlows/resolvers'
import * as dbFlowRuns from '../../../dbFlowRuns/resolvers'
import * as dbSteps from '../../../dbSteps/resolvers'

/**
 * ---- Queries ----------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export function allFlows(userId) {
  return dbFlows.allFlows(userId)
}

export async function queryFlow(flowId, userId) {
  const flow = await dbFlows.getFlowById(flowId);
  if (!flow.id) {
    throw new Error('E404_FLOW_NOT_FOUND');
  } else if (flow.userId !== userId) {
    throw new Error('E401_FLOW_ACCESS_DENIED');
  } else {
    return flow;
  }
}

export function getFlowById(flowId, userId) {
  return dbFlows.getFlowById(flowId, userId)
}

/**
 * ---- Mutations --------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export async function createFlow(flow, userId) {
  let newFlow = Object.assign(
    {},
    {
      id: uuid.v4(),
      userId: userId,
      name: null,
      description: null,
      draft: true,
      steps: []
    },
    flow
  )

  try {
    if (newFlow.steps.length === 0) {
      const newStep = await createStep({ flow: newFlow.id }, userId)
      newFlow = Object.assign({}, newFlow, { steps: [newStep.id] })
    }

    return dbFlows.createFlow(newFlow)
  } catch (err) {
    return Promise.reject(err)
  }
}

export async function setFlowDraftState(flow, state) {
  return dbFlows.updateFlow({
    id: flow.id,
    draft: state
  })
}

export async function updateFlow(flow, draft = true) {
  if (typeof flow.active === 'boolean') {
    const flowRuns = await getFlowRunsByFlowId(flow.id)
    await Promise.all(flowRuns.map(flowRun => updateFlowRun({ id: flowRun.id, active: flow.active })))
  }

  return dbFlows.updateFlow(flow).then(updatedFlow => setFlowDraftState(updatedFlow, draft))
}

export async function restoreFlow(id, userId) {
  // Restore flow steps from previous model stored in flowRun
  const [flow, flowRun] = await Promise.all([
    getFlowById(id, userId),
    dbFlowRuns.getLastFlowRunByFlowId(id)
  ])
  if (!flowRun) {
    return Promise.reject('No previous flow run found.')
  }

  // Delete all current flow steps
  await Promise.all(flow.steps.map(flowId => deleteStep(flowId, userId)))

  // Restore all steps from the previous flow
  await Promise.all(flowRun.flow.steps.map(step =>
    dbSteps.createStep(Object.assign({}, step, {
      service: step.service.id,
      flow: step.flow
    }))))

  // Restore old flow steps relations and take flow out of draft state
  return dbFlows.updateFlow(Object.assign({}, flow, {
    steps: flowRun.flow.steps.map(step => step.id),
    draft: false
  }))
}

export function deleteFlow(id, userId) {
  return getFlowById(id, userId)
    .then(flow =>
      Promise.all(flow.steps.map((stepId) => {
        console.log(`DELETE STEP: ${stepId}`)
        return deleteStep(stepId, userId)
      })))
    .then(() => dbFlows.deleteFlow(id))
    .then(() => ({ id }))
}

// Generate step positions after inserting a new step
export async function generateFlowStepsPositions(flow, newStep) {
  let steps = await batchGetStepByIds(flow.steps)
  steps = _sortBy(steps, 'position')

  // Find steps that need to be updated because their position is equal or higher
  // than the given new step
  let updateSteps = [],
      pos = newStep.position

  updateSteps = steps
    .filter(step => step.id !== newStep.id && step.position >= newStep.position)
    .map((step) => {
      pos++
      step.position = pos
      return step
    })

  return Promise.all(updateSteps.map(step => dbSteps.updateStep(step)))
}

// Generate step positions after removing a step
export async function regenerateFlowStepsPositions(flow) {
  let steps = [],
      pos = 0

  if (flow.steps.length > 0) {
    steps = await batchGetStepByIds(flow.steps)
    steps = _sortBy(steps, 'position')
  }

  if (steps.length <= 1) {
    return Promise.resolve()
  }

  // Find steps that need to be updated because their position leaves a gap
  const updateSteps = steps.reduce((result, step) => {
    if (step.position !== pos) {
      result.push(Object.assign({}, step, {
        position: pos
      }))
    }

    pos++
    return result
  }, [])

  console.log(updateSteps)

  return Promise.all(updateSteps.map(step => dbSteps.updateStep(step)))
}
