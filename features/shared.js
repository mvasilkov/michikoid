/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import { ts } from 'ts-morph'

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
 */
export function replace(old, updated) {
    old.replaceWithText(
        nodeNeedsParentheses(updated) && !nodeInParentheses(old) ?
            '(' + updated.getText() + ')' : updated.getText()
    )
}
