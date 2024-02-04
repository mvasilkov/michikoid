/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import chalk from 'chalk'

export function printTitle(...a) {
    console.log(chalk.greenBright(...a))
}

export function printWarning(...a) {
    console.log(chalk.bgYellowBright.black(...a))
}

export function nodesEqual(a, b) {
    if (a.type !== b.type) return false
    switch (a.type) {
        case 'Identifier':
            return a.name === b.name

        case 'NumericLiteral':
        case 'StringLiteral':
            return a.value === b.value

        case 'MemberExpression':
            return nodesEqual(a.object, b.object) && nodesEqual(a.property, b.property)

        case 'ThisExpression':
            return true

        default:
            throw Error(`NotImplemented: nodesEqual() for type ${a.type}`)
    }
}

export function findComments(nodes, leadingTrailing, value) {
    const indices = []

    nodes.forEach((node, n) => {
        const comments = node[leadingTrailing + 'Comments']
        if (!Array.isArray(comments)) return
        comments.forEach((comment, c) => {
            if (comment.type === 'CommentLine' && comment.value === value) {
                indices.push({ n, c })
            }
        })
    })

    return indices
}
