import { test } from '@japa/runner'
import { ROLES, PRIVILEGED_ROLES, IMPORT_ROLES, PREDICTION_ROLES, QUERY_ROLES } from '#services/role_constants'

test.group('Role constants', () => {
  test('ROLES object has all required stakeholder roles', ({ assert }) => {
    assert.equal(ROLES.ADMIN, 'admin')
    assert.equal(ROLES.FIELD_AGENT, 'field_agent')
    assert.equal(ROLES.SUPERVISOR, 'supervisor')
    assert.equal(ROLES.GOV, 'gov')
    assert.equal(ROLES.NGO, 'ngo')
    assert.equal(ROLES.TRADER, 'trader')
    assert.equal(ROLES.RESEARCHER, 'researcher')
  })

  test('PRIVILEGED_ROLES includes admin and supervisor only', ({ assert }) => {
    assert.isTrue(PRIVILEGED_ROLES.includes('admin'))
    assert.isTrue(PRIVILEGED_ROLES.includes('supervisor'))
    assert.isFalse((PRIVILEGED_ROLES as string[]).includes('field_agent'))
  })

  test('IMPORT_ROLES includes admin, supervisor, field_agent', ({ assert }) => {
    assert.isTrue(IMPORT_ROLES.includes('admin'))
    assert.isTrue(IMPORT_ROLES.includes('supervisor'))
    assert.isTrue(IMPORT_ROLES.includes('field_agent'))
    assert.isFalse((IMPORT_ROLES as string[]).includes('trader'))
  })

  test('PREDICTION_ROLES includes admin, supervisor, researcher, ngo', ({ assert }) => {
    assert.isTrue(PREDICTION_ROLES.includes('admin'))
    assert.isTrue(PREDICTION_ROLES.includes('researcher'))
    assert.isTrue(PREDICTION_ROLES.includes('ngo'))
    assert.isFalse((PREDICTION_ROLES as string[]).includes('trader'))
  })

  test('QUERY_ROLES includes gov and ngo but not field_agent', ({ assert }) => {
    assert.isTrue(QUERY_ROLES.includes('gov'))
    assert.isTrue(QUERY_ROLES.includes('ngo'))
    assert.isFalse((QUERY_ROLES as string[]).includes('field_agent'))
  })
})
