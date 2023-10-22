/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023 Mark Vasilkov
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn = `
export function countSetBits(n) {
  const N = n // .Alias
  let count = 0;
  while (N.value) {
    count += N.value & 1;
    N.value >>>= 1;
  }
  return count;
}`.replace('\n', '')

const progOut = `
export function countSetBits(n) {
  let count = 0;
  while (n.value) {
    count += n.value & 1;
    n.value >>>= 1;
  }
  return count;
}`.replace('\n', '')

test('Alias', () => {
  assert.strictEqual(expandMacros(progIn), progOut)
})
