import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn = `
export function countSetBits(n) {
  const N = n // .Alias
  let count = 0;
  while (N) {
    count += N & 1;
    N >>>= 1;
  }
  return count;
}`.replace('\n', '')

const progOut = `
export function countSetBits(n) {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}`.replace('\n', '')

test('Alias', () => {
  assert.strictEqual(expandMacros(progIn), progOut)
})
