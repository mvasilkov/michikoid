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
export function nodeInParentheses(node) {
    const file = node.getSourceFile()
    return file.getDescendantAtPos(node.getStart() - 1)?.getKind() === ts.SyntaxKind.OpenParenToken &&
        file.getDescendantAtPos(node.getEnd())?.getKind() === ts.SyntaxKind.CloseParenToken
}

/**
 * @param {import('ts-morph').Node<ts.Node>} node
 * @returns {boolean}
 */
export function nodeNeedsParentheses(node) {
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
