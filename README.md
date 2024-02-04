# Michikoid

*Michikoid* is a JavaScript macro processor, in the sense that it copies its input to the output, expanding macros as it goes.

## Installation

```sh
npm install -g michikoid
```

## Usage

```sh
michikoid <FILES>
```

## Supported macros

Michikoid understands the following macros:

### Alias

The *Alias* macro replaces all occurrences of a `const` identifier with a different identifier.

```js
const value = {n: 255}
const alias = value // .Alias
console.log(alias.n)

// Result:

const value = {n: 255}
console.log(value.n)
```

### Inline

The *Inline* macro takes a `const` declaration and inlines it into the output.

```js
const value = 255 // .Inline(1)
console.log(value)

// Result:

console.log(255)
```

The argument to *Inline* is the number of `const` occurrences to replace. This is to prevent code drift.

### InlineExp

The *InlineExp* macro inlines an assignment expression into the next occurrence of the expression's left-hand side.

```js
this.value = 255 // .InlineExp
console.log(this.value)

// Result:

console.log(this.value = 255)
```

### InlineExp(RHS)

The *InlineExp(RHS)* macro variant inlines an assignment expression into the next occurrence of the expression's right-hand side.

```js
this.value = 128 // .InlineExp(RHS)
console.log(128)

// Result:

console.log(this.value = 128)
```

### RewriteProps

The *RewriteProps* macro updates property accessors to use different property names. It should be placed on the first line of a block.

```js
ini() {
  // .RewriteProps(r=x, g=y, b=z)
  this.r = 255
  this['g'] = 0
  this.b = 128
}

// Result:

ini() {
  this.x = 255
  this['y'] = 0
  this.z = 128
}
```

### DeadCode

The *DeadCode* macro removes all statements between itself and the nearest *End(DeadCode)* macro on the same level of indentation.

```js
const value = 255
// .DeadCode
console.log(value)
// .End(DeadCode)

// Result:

const value = 255
```
