#!/usr/bin/env node

import { argv } from 'node:process'
import fs from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import { parse } from '@babel/parser'
import { cloneNode } from '@babel/types'
// — Mom, can I have ECMAScript modules?
// — No, we have ECMAScript modules at home.
// ECMAScript modules at home:
import pkg from '@babel/generator'
import pkg2 from '@babel/traverse'

const { default: generate } = pkg
const { default: traverse } = pkg2

function printTitle(...args) {
    console.log()
    console.log(chalk.greenBright(...args))
}

function printWarning(...args) {
    console.log(chalk.bgYellowBright.black(...args))
}

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
                printTitle(`Michikoid found Inline(${N})`)
                console.log(js.slice(decl.start, decl.trailingComments[0].end))

                const { name } = decl.declarations[0].id
                const binding = path.scope.getBinding(name)
                if (!binding.referenced) {
                    printWarning('Not referenced, skipping')
                    return
                }
                else if (binding.references !== N) {
                    printWarning(`Want ${N} references, got ${binding.references} instead, skipping`)
                    return
                }

                const { init } = decl.declarations[0]
                binding.referencePaths.forEach(p => {
                    p.replaceWith(cloneNode(init))
                })

                path.remove()
            },
        })
        const result = generate(ast, {}, js).code

        fs.writeFileSync(a, result, 'utf-8')
    })
}

main()
