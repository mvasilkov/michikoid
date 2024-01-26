/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn1 = `
export const getPublicPackages = isExperimental => {
  const packageNames = Object.keys(stablePackages);
  if (isExperimental) {
    // .RewriteProps(push=append)
    packageNames.push(...experimentalPackages);
  }
  return packageNames;
};`.replace('\n', '')

const progOut1 = `
export const getPublicPackages = isExperimental => {
  const packageNames = Object.keys(stablePackages);
  if (isExperimental) {
    packageNames.append(...experimentalPackages);
  }
  return packageNames;
};`.replace('\n', '')

const progIn2 = `
export const getPublicPackages = isExperimental => {
  // .RewriteProps(keys=values, push=append)
  const packageNames = Object.keys(stablePackages);
  if (isExperimental) {
    packageNames.push(...experimentalPackages);
  }
  return packageNames;
};`.replace('\n', '')

const progOut2 = `
export const getPublicPackages = isExperimental => {
  const packageNames = Object.values(stablePackages);
  if (isExperimental) {
    packageNames.append(...experimentalPackages);
  }
  return packageNames;
};`.replace('\n', '')

test('RewriteProps', () => {
  assert.strictEqual(expandMacros(progIn1), progOut1)
  assert.strictEqual(expandMacros(progIn2), progOut2)
})
