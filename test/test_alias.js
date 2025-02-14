/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024, 2025 Mark Vasilkov
 */
'use strict'

import assert from 'node:assert/strict'
import test from 'node:test'

import { expandMacrosInString } from '../app.js'

const in1 = `
export function hai() {
    const a = 'hai' // .Alias
    console.log(a)
    return a
}
`
const out1 = `
export function hai() {
    console.log('hai')
    return 'hai'
}
`

const in2 = `
export function hai() {
    const a = 'hai' // .Alias
    const b = a.length // .Alias
    console.log(b)
    return b
}
`
const out2 = `
export function hai() {
    console.log('hai'.length)
    return 'hai'.length
}
`

const in3 = `
const a = 'type' + 'script' // .Alias
const b = a.length // .Alias
console.log(b)
`
const out3 = `
console.log(('type' + 'script').length)
`

const in4 = `
const a = 'type' + 'script' // .Alias
const b = [a] // .Alias
console.log(b)
`
const out4 = `
console.log(['type' + 'script'])
`

const in5 = `
type A = { a: 'a' }
type B = A & { b?: 'b' }

export function ab() {
    const a: A = { a: 'a' }
    const b: B = a // .Alias
    return b.b = 'b'
}
`
const out5 = `
type A = { a: 'a' }
type B = A & { b?: 'b' }

export function ab() {
    const a: A = { a: 'a' }
    return (<B>a).b = 'b'
}
`

test('Alias', () => {
    assert.equal(expandMacrosInString(in1), out1)
    assert.equal(expandMacrosInString(in2), out2)
    assert.equal(expandMacrosInString(in3), out3)
    assert.equal(expandMacrosInString(in4), out4)
    assert.equal(expandMacrosInString(in5), out5)
})
