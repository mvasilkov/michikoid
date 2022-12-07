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
                let opt
                switch (false) {
                    case decl.trailingComments?.[0]?.type === 'CommentLine':
                    case (opt = decl.trailingComments?.[0]?.value?.match(/^ Inline(?:\((\d+)\))?$/)) ?? false:
                    case decl.kind === 'const':
                    case decl.declarations.length === 1:
                        return
                }
                const N = opt[1] ? parseInt(opt[1]) : 1
                console.log(`Michikoid found Inline(${N})`)
                console.log(generate(decl, { comments: false }, js).code)

                const { name } = decl.declarations[0].id
                const binding = path.scope.getBinding(name)
                if (!binding.referenced) {
                    console.log('Not referenced, skipping')
                    return
                }
                else if (binding.references !== N) {
                    console.log(`Want ${N} references, got ${binding.references} instead, skipping`)
                    return
                }
            },
        })
        const result = generate(ast, {}, js).code

        fs.writeFileSync(a, result, 'utf-8')
    })
}

main()
