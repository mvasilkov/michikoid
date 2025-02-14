/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024, 2025 Mark Vasilkov
 */
'use strict'

import assert from 'node:assert/strict'
import test from 'node:test'

import { expandMacrosInString } from '../app.js'

const in1 = ''

const in2 = `
export const splitValues = array => {
    for (let n = array.length - 1; n > -1; --n) {
        const value = array[n]
        if (value.includes(',')) {
            array.splice(n, 1, ...value.split(','))
        }
    }
}
`

test('Identity function', () => {
    assert.equal(expandMacrosInString(in1), in1)
    assert.equal(expandMacrosInString(in2), in2)
})
