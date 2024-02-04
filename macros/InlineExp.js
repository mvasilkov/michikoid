/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import { cloneNode } from '@babel/types'
import { printTitle, printWarning, nodesEqual } from './shared.js'

export const InlineExp = {
    ExpressionStatement(js, path) {
        const decl = path.node
        let opt
        switch (false) {
            case decl.trailingComments?.[0]?.type === 'CommentLine':
            case (opt = decl.trailingComments?.[0]?.value?.match(/^ \.InlineExp(?:\((RHS)\))?$/)) ?? false:
            case decl.expression.type === 'AssignmentExpression':
                return
        }
        const rhs = opt[1] === 'RHS'
        printTitle(`Michikoid found InlineExp${rhs ? '(RHS)' : ''}`)
        console.log(js.slice(decl.start, decl.trailingComments[0].end))

        const inlineNode = rhs ? decl.expression.right : decl.expression.left
        let targetPath = null
        path.scope.path.traverse({
            enter(path) {
                if (path.node.start <= decl.expression.right.end ||
                    !nodesEqual(path.node, inlineNode)) return

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
}
