import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateOutcomeInput } from '../validate-outcome'

describe('validateOutcomeInput', () => {
  it('returns error when placed is missing', () => {
    const err = validateOutcomeInput({})
    assert.ok(err, 'should return an error')
    assert.equal(err?.field, 'placed')
  })

  it('returns error when placed is a string', () => {
    const err = validateOutcomeInput({ placed: 'yes' })
    assert.ok(err)
    assert.equal(err?.field, 'placed')
  })

  it('returns error when placed is null', () => {
    const err = validateOutcomeInput({ placed: null })
    assert.ok(err)
    assert.equal(err?.field, 'placed')
  })

  it('passes when placed is true', () => {
    assert.equal(validateOutcomeInput({ placed: true }), null)
  })

  it('passes when placed is false', () => {
    assert.equal(validateOutcomeInput({ placed: false }), null)
  })

  it('returns error when retainedAt90 is a non-boolean truthy value', () => {
    const err = validateOutcomeInput({ placed: true, retainedAt90: 1 })
    assert.ok(err)
    assert.equal(err?.field, 'retainedAt90')
  })

  it('passes when retainedAt90 is null (optional)', () => {
    assert.equal(validateOutcomeInput({ placed: true, retainedAt90: null }), null)
  })

  it('returns error when performanceRating is 0 (below minimum)', () => {
    const err = validateOutcomeInput({ placed: true, performanceRating: 0 })
    assert.ok(err)
    assert.equal(err?.field, 'performanceRating')
  })

  it('returns error when performanceRating is 6 (above maximum)', () => {
    const err = validateOutcomeInput({ placed: true, performanceRating: 6 })
    assert.ok(err)
    assert.equal(err?.field, 'performanceRating')
  })

  it('returns error when performanceRating is a float', () => {
    const err = validateOutcomeInput({ placed: true, performanceRating: 3.5 })
    assert.ok(err)
    assert.equal(err?.field, 'performanceRating')
  })

  it('passes for all valid performanceRating values 1-5', () => {
    for (const r of [1, 2, 3, 4, 5]) {
      assert.equal(validateOutcomeInput({ placed: true, performanceRating: r }), null, `rating ${r} should be valid`)
    }
  })

  it('passes when performanceRating is null (optional)', () => {
    assert.equal(validateOutcomeInput({ placed: false, performanceRating: null }), null)
  })

  it('passes a fully populated valid payload', () => {
    assert.equal(validateOutcomeInput({
      placed: true,
      retainedAt90: true,
      retainedAt180: false,
      performanceRating: 4,
      notes: 'Excellent hire',
    }), null)
  })
})
