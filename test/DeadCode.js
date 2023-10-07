import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn = `
export function isPowerOf2(number) {
  // .DeadCode
  if (number < 1) {
    return false;
  }
  // .EndDeadCode
  return (number & number - 1) === 0;
}`.replace('\n', '')

const progOut = `
export function isPowerOf2(number) {
  return (number & number - 1) === 0;
}`.replace('\n', '')

test('DeadCode', () => {
  assert.strictEqual(expandMacros(progIn), progOut)
})
