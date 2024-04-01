/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import { ts } from 'ts-morph'

/**
 * @param {import('ts-morph').Node<ts.Node>} node
 */
function hasDeadCodeMacro(node) {
    const ranges = node.getTrailingCommentRanges()
    return ranges.some(range =>
        range.getKind() === ts.SyntaxKind.SingleLineCommentTrivia &&
        range.getText() === '// .DeadCode')
}

/**
 * @param {import('ts-morph').SourceFile} file
 */
export function expandDeadCode(file) {
    /**
     * @type {import('ts-morph').Node<ts.Node>[]}
     */
    const found = []

    file.forEachDescendant((node, traversal) => {
        if (!hasDeadCodeMacro(node)) return

        const line = file.getFullText().slice(
            node.getNonWhitespaceStart(), node.getTrailingTriviaEnd())
        console.error(`Found: ${line}`)
        traversal.skip()
        found.push(node)
    })

    found.forEach(node => node.remove())
}
