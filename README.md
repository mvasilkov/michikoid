# Michikoid

*Michikoid* is a TypeScript and JavaScript macro processor, in the sense that it copies its input to the output, expanding macros as it goes.

The app is based on the excellent [ts-morph][ts-morph] library.

[ts-morph]: https://github.com/dsherret/ts-morph

## Installation

```sh
npm install -g michikoid
```

## Usage

Pass a <kbd>tsconfig.json</kbd> file to work on an entire project and save changes to a different directory.

```sh
michikoid --project <tsconfig> <out_dir>
```

Alternatively, pass a <kbd>.ts</kbd> or <kbd>.js</kbd> file to handle it with default settings and print to the standard output.

```sh
michikoid <file>
```

The default settings are:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ES2022"
  }
}
```

## Macros

Michikoid understands the following macros:

### Alias

The *Alias* macro replaces all occurrences of a `const` identifier with a different identifier.

```js
const value = {n: 255}
const alias = value // .Alias
console.log(alias.n)

// Expands to:

const value = {n: 255}
console.log(value.n)
```

### Inline

The *Inline* macro takes a `const` declaration and inlines it into the output.

```js
const value = 255 // .Inline(1)
console.log(value)

// Expands to:

console.log(255)
```

### InlineExp

The *InlineExp* macro inlines an assignment expression into the next occurrence of that expression's left-hand side. Can also be spelled as *InlineExpLeft*.

```js
this.value = 255 // .InlineExp
console.log(this.value)

// Expands to:

console.log(this.value = 255)
```

### InlineExpRight

The *InlineExpRight* macro variant inlines an assignment expression into the next occurrence of that expression's right-hand side.

```js
this.value = 128 // .InlineExpRight
console.log(128)

// Expands to:

console.log(this.value = 128)
```

### DeadCode

The *DeadCode* macro deletes the statement it's applied to.

```js
const value = 255
console.log(value) // .DeadCode

// Expands to:

const value = 255
```
