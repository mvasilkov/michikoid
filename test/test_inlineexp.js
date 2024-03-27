/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import assert from 'node:assert/strict'
import test from 'node:test'

import { expandMacrosInString } from '../app.js'

const in1 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0
        this.v1 = v1
        this.p0 = v0.position
        this.p1 = v1.position // .InlineExp
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`
const out1 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0
        this.v1 = v1
        this.p0 = v0.position
        this.lengthSquared = this.p0.distanceSquared(this.p1 = v1.position)
    }
}
`

const in2 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0
        this.v1 = v1
        this.p0 = v0.position // .InlineExp
        this.p1 = v1.position // .InlineExp
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`
const out2 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0
        this.v1 = v1
        this.lengthSquared = (this.p0 = v0.position).distanceSquared(this.p1 = v1.position)
    }
}
`

const in3 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0 // .InlineExpLeft
        this.v1 = v1 // .InlineExpLeft
        this.p0 = this.v0.position // .InlineExpLeft
        this.p1 = this.v1.position // .InlineExpLeft
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`
const out3 = `
export class Constraint {
    constructor(v0, v1) {
        this.lengthSquared = (this.p0 = (this.v0 = v0).position).distanceSquared(this.p1 = (this.v1 = v1).position)
    }
}
`

const in4 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0
        this.v1 = v1 // .InlineExpRight
        this.p0 = v0.position
        this.p1 = v1.position
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`
const out4 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0
        this.p0 = v0.position
        this.p1 = (this.v1 = v1).position
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`

const in5 = `
export class Constraint {
    constructor(v0, v1) {
        this.v0 = v0 // .InlineExpRight
        this.v1 = v1 // .InlineExpRight
        this.p0 = v0.position
        this.p1 = v1.position
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`
const out5 = `
export class Constraint {
    constructor(v0, v1) {
        this.p0 = (this.v0 = v0).position
        this.p1 = (this.v1 = v1).position
        this.lengthSquared = this.p0.distanceSquared(this.p1)
    }
}
`

const in6 = `
export function bug() {
    let t = 1
    t = Math.atan2(t, t) // .InlineExp
    console.log(t)
}
`
const out6 = `
export function bug() {
    let t = 1
    console.log(t = Math.atan2(t, t))
}
`

test('InlineExp', () => {
    assert.equal(expandMacrosInString(in1), out1)
    assert.equal(expandMacrosInString(in2), out2)
    assert.equal(expandMacrosInString(in3), out3)
    assert.equal(expandMacrosInString(in4), out4)
    assert.equal(expandMacrosInString(in5), out5)
    assert.equal(expandMacrosInString(in6), out6)
})
