import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn1 = `
let energy = null;
let seam = null;
for (let n = 0; n < count; ++n) {
  energy = calculateEnergyMap(img, size); // .InlineExp
  seam = findLowEnergySeam(energy, size);
  deleteSeam(img, seam, size);
}`.replace('\n', '')

const progOut1 = `
let energy = null;
let seam = null;
for (let n = 0; n < count; ++n) {
  seam = findLowEnergySeam(energy = calculateEnergyMap(img, size), size);
  deleteSeam(img, seam, size);
}`.replace('\n', '')

const progIn2 = `
let energy = null;
let seam = null;
for (let n = 0; n < count; ++n) {
  energy = calculateEnergyMap(img, size); // .InlineExp
  seam = findLowEnergySeam(energy, size); // .InlineExp
  deleteSeam(img, seam, size);
}`.replace('\n', '')

const progOut2 = `
let energy = null;
let seam = null;
for (let n = 0; n < count; ++n) {
  deleteSeam(img, seam = findLowEnergySeam(energy = calculateEnergyMap(img, size), size), size);
}`.replace('\n', '')

test('InlineExp', () => {
    assert.strictEqual(expandMacros(progIn1), progOut1)
    assert.strictEqual(expandMacros(progIn2), progOut2)
})
