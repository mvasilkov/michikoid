#!/usr/bin/env node

import { argv } from 'node:process'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { parse } from '@babel/parser'
// — Mom, can I have ECMAScript modules?
// — No, we have ECMAScript modules at home.
// ECMAScript modules at home:
import pkg from '@babel/generator'
import pkg2 from '@babel/traverse'

const { default: generate } = pkg
const { default: traverse } = pkg2

function main() {
    argv.slice(2).forEach(a => {
        a = resolve(a)

        if (!fs.statSync(a).isFile()) {
            console.log(`${a} is not a file`)
            return
        }

        const js = fs.readFileSync(a, 'utf-8')
        const ast = parse(js, {
            sourceType: 'module',
        })
        traverse(ast, {
            VariableDeclaration(path) {
                const decl = path.node
                switch (false) {
                    case decl.trailingComments?.[0]?.type === 'CommentLine':
                    case decl.trailingComments?.[0]?.value === ' Inline':
                    case decl.kind === 'const':
                    case decl.declarations.length === 1:
                        return
                }
            },
        })
        const result = generate(ast, {}, js)

        fs.writeFileSync(a, result.code, 'utf-8')
    })
}

main()
