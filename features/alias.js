/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024, 2025 Mark Vasilkov
 */
'use strict'

import { ts } from 'ts-morph'

import { printError, printFound, replace } from './shared.js'

const unlimited = -1

/**
 * @param {import('ts-morph').VariableStatement} def
 * @returns {number | undefined}
 */
function hasAliasMacro(def) {
    const ranges = def.getTrailingCommentRanges()
    if (!ranges.length) return

    const alias = ranges.some(range =>
        range.getKind() === ts.SyntaxKind.SingleLineCommentTrivia &&
        range.getText() === '// .Alias')
    if (alias) return unlimited

    /**
     * Optional .Inline count
     * @type {string[]}
     */
    let opt
    const inline = ranges.some(range =>
        range.getKind() === ts.SyntaxKind.SingleLineCommentTrivia &&
        (opt = /^\/\/ \.Inline(?:\((\d+)\))?$/.exec(range.getText())))
    if (inline) return opt[1] ? parseInt(opt[1]) : 1
}

/**
 * @param {import('ts-morph').SourceFile} file
 */
export function expandAlias(file) {
    /**
     * @type {import('ts-morph').VariableStatement[]}
     */
    const defs = []
    file.forEachDescendant(node => {
        if (node.getKind() === ts.SyntaxKind.VariableStatement)
            defs.push(node)
    })

    defs.forEach(def => {
        const count = hasAliasMacro(def)
        if (typeof count === 'undefined') return

        const line = file.getFullText().slice(
            def.getNonWhitespaceStart(), def.getTrailingTriviaEnd())
        printFound(file, line)

        const dlist = def.getDeclarationList()
        const constDef = dlist.getFlags() & ts.NodeFlags.Const
        if (!constDef) {
            printError('Expected const')
            return
        }

        const decls = dlist.getDeclarations()
        if (decls.length !== 1) {
            printError('Expected single declaration')
            return
        }

        const decl = decls.pop()
        const alias = decl.getNameNode()
        if (!alias.isKind(ts.SyntaxKind.Identifier)) {
            printError('Expected identifier')
            return
        }

        const value = decl.getInitializer()
        if (!value) {
            printError('Expected initializer')
            return
        }

        /**
         * @type {import('ts-morph').Node<ts.Node>[]}
         */
        const refs = alias.findReferencesAsNodes()
        if (count !== unlimited && refs.length !== count) {
            const s = count === 1 ? '' : 's'
            printError(`Expected ${count} reference${s}, found ${refs.length}`)
            return
        }

        refs.forEach(ref => replace(ref, value))

        def.remove()
    })
}
