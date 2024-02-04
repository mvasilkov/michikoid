#!/usr/bin/env node

/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import { argv } from 'node:process'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from '@babel/parser'
import generate from '@babel/generator'
import traverse from '@babel/traverse'
import { Macros } from './macros/macros.js'

export function expandMacros(js) {
    const ast = parse(js, { sourceType: 'module' })
    traverse(ast, {
        VariableDeclaration(path) {
            Macros.Alias.VariableDeclaration(js, path)
            if (!path.node) return
            Macros.Inline.VariableDeclaration(js, path)
        },
        ExpressionStatement(path) {
            Macros.InlineExp.ExpressionStatement(js, path)
        },
        BlockStatement(path) {
            Macros.DeadCode.BlockStatement(js, path)
            Macros.RewriteProps.BlockStatement(js, path)
        },
    })
    return generate(ast, { /* retainLines: true */ }, js).code
}

function main(paths) {
    paths.forEach(a => {
        a = resolve(a)

        if (!fs.statSync(a).isFile()) {
            console.log(`${a} is not a file`)
            return
        }

        const js = fs.readFileSync(a, 'utf-8')
        const result = expandMacros(js)

        fs.writeFileSync(a, result, 'utf-8')
    })
}

/** Is this script being run as an executable? */
function cli() {
    const path = fs.realpathSync(argv[1])
    const url = pathToFileURL(path).href
    return import.meta.url === url
}

if (cli()) {
    main(argv.slice(2))
}
