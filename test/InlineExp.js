import assert from 'node:assert/strict'
import test from 'node:test'
import { expandMacros } from '../app.js'

const progIn1 = `
export class Constraint {
  constructor(v0, v1) {
    this.v0 = v0
    this.v1 = v1
    this.p0 = v0.position
    this.p1 = v1.position // .InlineExp
    this.lengthSquared = this.p0.distanceSquared(this.p1)
  }
}`.replace('\n', '')

const progOut1 = `
export class Constraint {
  constructor(v0, v1) {
    this.v0 = v0;
    this.v1 = v1;
    this.p0 = v0.position;
    this.lengthSquared = this.p0.distanceSquared(this.p1 = v1.position);
  }
}`.replace('\n', '')

const progIn2 = `
export class Constraint {
  constructor(v0, v1) {
    this.v0 = v0
    this.v1 = v1
    this.p0 = v0.position // .InlineExp
    this.p1 = v1.position // .InlineExp
    this.lengthSquared = this.p0.distanceSquared(this.p1)
  }
}`.replace('\n', '')

const progOut2 = `
export class Constraint {
  constructor(v0, v1) {
    this.v0 = v0;
    this.v1 = v1;
    this.lengthSquared = (this.p0 = v0.position).distanceSquared(this.p1 = v1.position);
  }
}`.replace('\n', '')

const progIn3 = `
export class Constraint {
  constructor(v0, v1) {
    this.v0 = v0 // .InlineExp
    this.v1 = v1 // .InlineExp
    this.p0 = this.v0.position // .InlineExp
    this.p1 = this.v1.position // .InlineExp
    this.lengthSquared = this.p0.distanceSquared(this.p1)
  }
}`.replace('\n', '')

const progOut3 = `
export class Constraint {
  constructor(v0, v1) {
    this.lengthSquared = (this.p0 = (this.v0 = v0).position).distanceSquared(this.p1 = (this.v1 = v1).position);
  }
}`.replace('\n', '')

test('InlineExp', () => {
  assert.strictEqual(expandMacros(progIn1), progOut1)
  assert.strictEqual(expandMacros(progIn2), progOut2)
  assert.strictEqual(expandMacros(progIn3), progOut3)
})
