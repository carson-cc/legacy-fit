import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { inferRoleType } from '../role-inference'

describe('inferRoleType', () => {
  it('matches superintendent (case-insensitive)', () => {
    assert.equal(inferRoleType('Superintendent'), 'superintendent')
    assert.equal(inferRoleType('SUPERINTENDENT OF CONSTRUCTION'), 'superintendent')
  })

  it('matches project manager and PM abbreviation', () => {
    assert.equal(inferRoleType('Project Manager'), 'project_manager')
    assert.equal(inferRoleType('Senior PM'), 'project_manager')
    assert.equal(inferRoleType('project manager, civil'), 'project_manager')
  })

  it('matches CFO and Chief Financial variants', () => {
    assert.equal(inferRoleType('CFO'), 'cfo')
    assert.equal(inferRoleType('Chief Financial Officer'), 'cfo')
  })

  it('matches foreman', () => {
    assert.equal(inferRoleType('Foreman'), 'foreman')
    assert.equal(inferRoleType('general foreman'), 'foreman')
  })

  it('matches estimator variants', () => {
    assert.equal(inferRoleType('Estimator'), 'estimator')
    assert.equal(inferRoleType('Senior Estimating Manager'), 'estimator')
  })

  it('matches sales, account exec, business dev', () => {
    assert.equal(inferRoleType('Sales Director'), 'sales_rep')
    assert.equal(inferRoleType('Account Executive'), 'sales_rep')
    assert.equal(inferRoleType('Business Development Manager'), 'sales_rep')
  })

  it('returns trimmed title for unrecognised roles', () => {
    assert.equal(inferRoleType('Director of Operations'), 'Director of Operations')
    assert.equal(inferRoleType('  VP Engineering  '), 'VP Engineering')
  })

  it('priority: superintendent wins over project manager when both words present', () => {
    // Superintendent regex is checked first
    assert.equal(inferRoleType('Superintendent Project Manager'), 'superintendent')
  })
})
