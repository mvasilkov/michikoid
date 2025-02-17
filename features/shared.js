/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024, 2025 Mark Vasilkov
 */
'use strict'

import { relative } from 'node:path'

import ansi from 'ansi-styles'
import { ts } from 'ts-morph'

/**
 * @type {string | null}
 */
let projectDir = null

/**
 * @param {string} dir
 */
export function setProjectDir(dir) {
    projectDir = dir
}

/**
 * @param {import('ts-morph').SourceFile} file
 * @param {string} line
 */
export function printFound(file, line) {
    console.error(`${ansi.greenBright.open}Found: ${line}${ansi.greenBright.close}`)
    if (projectDir) {
        const path = relative(projectDir, file.getFilePath())
        console.error(`${ansi.blueBright.open}In: ${path}${ansi.blueBright.close}`)
    }
}

/**
 * @param {string} line
 */
export function printError(line) {
    console.error([
        ansi.bgYellowBright.open,
        ansi.black.open,
        line,
        ansi.black.close,
        ansi.bgYellowBright.close,
    ].join(''))
}

/**
 * @param {import('ts-morph').Node<ts.Node>} a
 * @param {import('ts-morph').Node<ts.Node>} b
 * @returns {boolean}
 */
export function nodesEqual(a, b) {
    return a.getKind() === b.getKind() && a.getText() === b.getText()
}

/**
 * @param {import('ts-morph').Node<ts.Node>} node
 * @returns {boolean}
 */
function nodeInParentheses(node) {
    const file = node.getSourceFile()
    const before = file.getDescendantAtPos(node.getStart() - 1)?.getKind()
    const after = file.getDescendantAtPos(node.getEnd())?.getKind()

    return before === ts.SyntaxKind.OpenParenToken && after === ts.SyntaxKind.CloseParenToken ||
        before === ts.SyntaxKind.OpenBracketToken && after === ts.SyntaxKind.CloseBracketToken
}

/**
 * @param {import('ts-morph').Node<ts.Node>} node
 * @returns {boolean}
 */
function nodeNeedsParentheses(node) {
    switch (node.getKind()) {
        // Missing: new with argument list, different literals
        case ts.SyntaxKind.CallExpression:
        case ts.SyntaxKind.ElementAccessExpression:
        case ts.SyntaxKind.Identifier:
        case ts.SyntaxKind.ParenthesizedExpression:
        case ts.SyntaxKind.PropertyAccessExpression:
        case ts.SyntaxKind.StringLiteral:
            return false
    }
    return true
}

/**
 * @param {import('ts-morph').Node<ts.Node>} old
 * @param {import('ts-morph').Node<ts.Node>} updated
 * @param {import('ts-morph').TypeNode} [type]
 */
export function replace(old, updated, type) {
    const upd = (type ? '<' + type.getText() + '>' : '') + updated.getText()

    old.replaceWithText(
        (type || nodeNeedsParentheses(updated)) && !nodeInParentheses(old) ?
            '(' + upd + ')' : upd
    )
}
