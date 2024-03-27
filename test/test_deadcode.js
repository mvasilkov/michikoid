/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import assert from 'node:assert/strict'
import test from 'node:test'

import { expandMacrosInString } from '../app.js'

const in1 = `
export function nop() {
    return undefined // .DeadCode
}
`
const out1 = `
export function nop() {
}
`

const in2 = `
export function powerof2(n) {
    if (n < 1) {
        return false
    } // .DeadCode
    return (n & n - 1) === 0
}
`
const out2 = `
export function powerof2(n) {
    return (n & n - 1) === 0
}
`

test('DeadCode', () => {
    assert.equal(expandMacrosInString(in1), out1)
    assert.equal(expandMacrosInString(in2), out2)
})
