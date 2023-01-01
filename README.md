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
const F = 255 // Inline(1)
console.log(F)

/* Result: */

console.log(255)
```

The argument to *Inline* is the exact number of `const` instances to replace. This is to prevent code drift.
