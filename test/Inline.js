import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn = `
export const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; --i) {
    const param = array[i]; // .Inline(2)
    if (param.includes(',')) {
      array.splice(i, 1, ...param.split(','));
    }
  }
};`.replace('\n', '')

const progOut = `
export const splitCommaParams = array => {
  for (let i = array.length - 1; i >= 0; --i) {
    if (array[i].includes(',')) {
      array.splice(i, 1, ...array[i].split(','));
    }
  }
};`.replace('\n', '')

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
  assert.strictEqual(expandMacros(progIn), progOut)
})

test('Inline should do nothing if the number of instances is incorrect', () => {
  assert.strictEqual(expandMacros(progIncorrect1), progIncorrect1)
  assert.strictEqual(expandMacros(progIncorrect2), progIncorrect2)
})
