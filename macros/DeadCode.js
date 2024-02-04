/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import { outdent } from '@mvasilkov/outdent'
import { printTitle, printWarning, findComments } from './shared.js'

export const DeadCode = {
    BlockStatement(js, path) {
        const decl = path.node
        const startIndices = findComments(decl.body, 'leading', ' .DeadCode')
        const endIndices = findComments(decl.body, 'trailing', ' .End(DeadCode)')

        if (startIndices.length !== endIndices.length) {
            printWarning('Mismatched DeadCode and End(DeadCode), skipping')
            return
        }

        while (startIndices.length !== 0) {
            printTitle('Michikoid found DeadCode')

            const start = startIndices.pop()
            const end = endIndices.pop()
            if (end.n < start.n) {
                printWarning('End(DeadCode) before DeadCode, skipping')
                return
            }

            console.log(outdent(js.slice(
                decl.body[start.n].leadingComments[start.c].start,
                decl.body[end.n].trailingComments[end.c].end)))

            decl.body[start.n - 1]?.trailingComments.splice(start.c)
            decl.body[start.n].leadingComments.splice(start.c)
            decl.body[end.n].trailingComments.splice(0, end.c + 1)
            decl.body[end.n + 1]?.leadingComments.splice(0, end.c + 1)

            for (let n = end.n; n >= start.n; --n) {
                path.get(`body.${n}`).remove()
            }
        }
    },
}
