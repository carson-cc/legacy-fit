export interface OutcomeInput {
  placed?: unknown
  retainedAt90?: unknown
  retainedAt180?: unknown
  performanceRating?: unknown
  notes?: unknown
}

export interface ValidationError {
  field: string
  message: string
}

export function validateOutcomeInput(body: OutcomeInput): ValidationError | null {
  if (typeof body.placed !== 'boolean') {
    return { field: 'placed', message: 'placed is required and must be a boolean' }
  }
  if (body.retainedAt90 != null && typeof body.retainedAt90 !== 'boolean') {
    return { field: 'retainedAt90', message: 'retainedAt90 must be a boolean' }
  }
  if (body.retainedAt180 != null && typeof body.retainedAt180 !== 'boolean') {
    return { field: 'retainedAt180', message: 'retainedAt180 must be a boolean' }
  }
  if (
    body.performanceRating != null &&
    (!Number.isInteger(body.performanceRating) ||
      (body.performanceRating as number) < 1 ||
      (body.performanceRating as number) > 5)
  ) {
    return { field: 'performanceRating', message: 'performanceRating must be an integer between 1 and 5' }
  }
  return null
}
