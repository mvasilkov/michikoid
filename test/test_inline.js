/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024, 2025 Mark Vasilkov
 */
'use strict'

import assert from 'node:assert/strict'
import test from 'node:test'

import { expandMacrosInString } from '../app.js'

const in1 = `
export const splitValues = array => {
    for (let n = array.length - 1; n > -1; --n) {
        const value = array[n] // .Inline(2)
        if (value.includes(',')) {
            array.splice(n, 1, ...value.split(','))
        }
    }
}
`
const out1 = `
export const splitValues = array => {
    for (let n = array.length - 1; n > -1; --n) {
        if (array[n].includes(',')) {
            array.splice(n, 1, ...array[n].split(','))
        }
    }
}
`

const in2 = `
const a = 'type' + 'script' // .Inline
const b = a.length // .Inline
console.log(b)
`
const out2 = `
console.log(('type' + 'script').length)
`

const in3 = `
export const splitValues = array => {
    for (let n = array.length - 1; n > -1; --n) {
        const value = array[n] // .Inline
        if (value.includes(',')) {
            array.splice(n, 1, ...value.split(','))
        }
    }
}
`

test('Inline', () => {
    assert.equal(expandMacrosInString(in1), out1)
    assert.equal(expandMacrosInString(in2), out2)
})

test('Inline with incorrect count', () => {
    assert.equal(expandMacrosInString(in3), in3)
})
