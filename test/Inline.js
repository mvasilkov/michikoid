import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn1 = `
export const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; --i) {
    const param = array[i]; // .Inline(2)
    if (param.includes(',')) {
      array.splice(i, 1, ...param.split(','));
    }
  }
};`.replace('\n', '')

const progOut1 = `
export const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; --i) {
    if (array[i].includes(',')) {
      array.splice(i, 1, ...array[i].split(','));
    }
  }
};`.replace('\n', '')

const progIn2 = `
export function countSetBits(n) {
  const N = n // .Inline(3)
  let count = 0;
  while (N.value) {
    count += N.value & 1;
    N.value >>>= 1;
  }
  return count;
}`.replace('\n', '')

const progOut2 = `
export function countSetBits(n) {
  let count = 0;
  while (n.value) {
    count += n.value & 1;
    n.value >>>= 1;
  }
  return count;
}`.replace('\n', '')

const progIncorrect1 = `
export const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; --i) {
    const param = array[i]; // .Inline
    if (param.includes(',')) {
      array.splice(i, 1, ...param.split(','));
    }
  }
};`.replace('\n', '')

const progIncorrect2 = `
export const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; --i) {
    const param = array[i]; // .Inline(3)
    if (param.includes(',')) {
      array.splice(i, 1, ...param.split(','));
    }
  }
};`.replace('\n', '')

test('Inline', () => {
  assert.strictEqual(expandMacros(progIn1), progOut1)
  assert.strictEqual(expandMacros(progIn2), progOut2)
})

test('Inline should do nothing if the number of instances is incorrect', () => {
  assert.strictEqual(expandMacros(progIncorrect1), progIncorrect1)
  assert.strictEqual(expandMacros(progIncorrect2), progIncorrect2)
})
