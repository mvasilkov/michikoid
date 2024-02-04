/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import { cloneNode } from '@babel/types'
import { printTitle, printWarning } from './shared.js'

export const Alias = {
    VariableDeclaration(js, path) {
        const decl = path.node
        switch (false) {
            case decl.trailingComments?.[0]?.type === 'CommentLine':
            case decl.trailingComments?.[0]?.value === ' .Alias':
            case decl.kind === 'const':
            case decl.declarations.length === 1:
            case decl.declarations[0].init.type === 'Identifier':
                return
        }
        printTitle(`Michikoid found Alias`)
        console.log(js.slice(decl.start, decl.trailingComments[0].end))

        const { name } = decl.declarations[0].id
        const binding = path.scope.getBinding(name)
        if (!binding.referenced) {
            printWarning('Not referenced, skipping')
            return
        }

        const { init } = decl.declarations[0]
        binding.referencePaths.forEach(p => {
            p.replaceWith(cloneNode(init))
        })

        path.getNextSibling().node?.leadingComments?.shift()
        path.remove()
    },
}
