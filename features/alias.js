/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import { ts } from 'ts-morph'

import { nodeInParentheses, nodeNeedsParentheses } from './shared.js'

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

        console.log(`Found: ${def.print().trimEnd()}`)

        const dlist = def.getDeclarationList()
        const constDef = dlist.getFlags() & ts.NodeFlags.Const
        if (!constDef) {
            console.log('Expected const')
            return
        }

        const decls = dlist.getDeclarations()
        if (decls.length !== 1) {
            console.log('Expected single declaration')
            return
        }

        const decl = decls[0]
        if (!decl.hasInitializer()) {
            console.log('Expected initializer')
            return
        }

        const alias = decl.getNameNode()
        if (!alias.isKind(ts.SyntaxKind.Identifier)) {
            console.log('Expected identifier')
            return
        }

        const value = decl.getInitializerOrThrow()

        /**
         * @type {import('ts-morph').Node<ts.Node>[]}
         */
        const refs = alias.findReferencesAsNodes()
        if (count !== unlimited && refs.length !== count) {
            console.log(`Expected ${count} references, found ${refs.length}`)
            return
        }

        refs.forEach(ref => {
            ref.replaceWithText(
                nodeNeedsParentheses(value) && !nodeInParentheses(ref) ?
                    '(' + value.getText() + ')' : value.getText()
            )
        })

        def.remove()
    })
}
