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
    console.log(chalk.greenBright(...args))
}

function printWarning(...args) {
    console.log(chalk.bgYellowBright.black(...args))
}

function nodesEqual(a, b) {
    if (a.type !== b.type) return false
    switch (a.type) {
        case 'Identifier':
            return a.name === b.name

        case 'MemberExpression':
            return nodesEqual(a.object, b.object) && nodesEqual(a.property, b.property)

        case 'ThisExpression':
            return true

        default:
            throw Error(`NotImplemented: nodesEqual() for type ${a.type}`)
    }
}

function main(paths) {
    paths.forEach(a => {
        a = resolve(a)

        if (!fs.statSync(a).isFile()) {
            console.log(`${a} is not a file`)
            return
        }

        const js = fs.readFileSync(a, 'utf-8')
        const ast = parse(js, { sourceType: 'module' })
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

                path.getNextSibling().node?.leadingComments?.shift()
                path.remove()
            },
            ExpressionStatement(path) {
                const decl = path.node
                switch (false) {
                    case decl.trailingComments?.[0]?.type === 'CommentLine':
                    case decl.trailingComments?.[0]?.value === ' InlineExp':
                    case decl.expression.type === 'AssignmentExpression':
                        return
                }
                printTitle('Michikoid found InlineExp')
                console.log(js.slice(decl.start, decl.trailingComments[0].end))

                let targetPath = null
                path.scope.path.traverse({
                    enter(path) {
                        if (path.node.start <= decl.expression.left.start ||
                            !nodesEqual(path.node, decl.expression.left)) return

                        targetPath = path
                        path.stop()
                    },
                })

                if (targetPath === null) {
                    printWarning('Not referenced, skipping')
                    return
                }

                targetPath.replaceWith(cloneNode(decl.expression))

                path.getNextSibling().node?.leadingComments?.shift()
                path.remove()
            },
            BlockStatement(path) {
                const decl = path.node
                const firstComment = decl.body[0]?.leadingComments?.[0]
                let opt
                switch (false) {
                    case firstComment?.type === 'CommentLine':
                    case (opt = firstComment.value?.match(/^ RewriteProps\((.*?)\)$/)) ?? false:
                        return
                }
                printTitle('Michikoid found RewriteProps')
                console.log(js.slice(firstComment.start, firstComment.end))

                const propMap = Object.fromEntries(opt[1].split(', ').map(kv => kv.split('=')))

                if (Object.keys(propMap).length === 0) {
                    printWarning('No properties, skipping')
                    return
                }

                path.traverse({
                    MemberExpression(path) {
                        const { property } = path.node
                        if (property.type === 'Identifier') {
                            if (propMap.hasOwnProperty(property.name)) {
                                property.name = propMap[property.name]
                            }
                        }
                        else if (property.type === 'StringLiteral') {
                            if (propMap.hasOwnProperty(property.value)) {
                                property.value = propMap[property.value]
                            }
                        }
                    }
                })

                decl.body[0].leadingComments.shift()
            },
        })
        const result = generate(ast, { /* retainLines: true */ }, js).code

        fs.writeFileSync(a, result, 'utf-8')
    })
}

main(argv.slice(2))
