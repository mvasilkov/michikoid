/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import { ts } from 'ts-morph'

import { nodesEqual, printError, printFound, replace } from './shared.js'

/**
 * @param {import('ts-morph').ExpressionStatement} expstat
 * @returns {boolean | undefined}
 */
function hasInlineExpMacro(expstat) {
    const ranges = expstat.getTrailingCommentRanges()
    if (!ranges.length) return

    /**
     * Optional .InlineExp side
     * @type {string[]}
     */
    let opt
    const inline = ranges.some(range =>
        range.getKind() === ts.SyntaxKind.SingleLineCommentTrivia &&
        (opt = /^\/\/ \.InlineExp(Left|Right)?$/.exec(range.getText())))
    if (inline) return opt[1] === 'Right'
}

/**
 * @param {import('ts-morph').SourceFile} file
 */
export function expandInlineExp(file) {
    /**
     * @type {import('ts-morph').ExpressionStatement[]}
     */
    const expstats = []
    file.forEachDescendant(node => {
        if (node.getKind() === ts.SyntaxKind.ExpressionStatement)
            expstats.push(node)
    })

    expstats.forEach(expstat => {
        const rhs = hasInlineExpMacro(expstat)
        if (typeof rhs === 'undefined') return

        const line = file.getFullText().slice(
            expstat.getNonWhitespaceStart(), expstat.getTrailingTriviaEnd())
        printFound(file, line)

        const exp = expstat.getExpressionIfKind(ts.SyntaxKind.BinaryExpression)
        if (!exp) {
            printError('Expected binary expression')
            return
        }

        const inline = rhs ? exp.getRight() : exp.getLeft()
        const scope = expstat.getFirstAncestorByKind(ts.SyntaxKind.Block) ?? file
        const found = scope.forEachDescendant((node, traversal) => {
            if (node.getStart() < exp.getEnd() || !nodesEqual(node, inline)) return

            traversal.stop()
            return node
        })
        if (!found) {
            printError('Expected to find a reference')
            return
        }

        replace(found, exp)

        expstat.remove()
    })
}
