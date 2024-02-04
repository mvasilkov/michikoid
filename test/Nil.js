/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const prog = `
export function countSetBits(n) {
  let count = 0;
  while (n) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}`.replace('\n', '')

test('In the absence of macros, expandMacros should behave like an identity function', () => {
  assert.strictEqual(expandMacros(prog), prog)
})
