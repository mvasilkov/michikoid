# michikoid

Michikoid is a JavaScript macro processor, in the sense that it copies its input to the output, expanding macros as it goes.

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

### Inline

The *Inline* macro takes a `const` declaration and inlines it into the output.

```js
const value = 255 // Inline(1)
console.log(value)

// Result:

console.log(255)
```

The argument to *Inline* is the exact number of `const` instances to replace. This is to prevent code drift.

### InlineExp

The *InlineExp* macro takes an assignment expression and inlines it into the next instance of the expression's left-hand side.
<!-- The *InlineExp* macro replaces the next occurrence of the left-hand side of an assignment expression with the expression itself. -->

```js
this.value = 255 // InlineExp
console.log(this.value)

// Result:

console.log(this.value = 255)
```
