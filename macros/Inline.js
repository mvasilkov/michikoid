/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import { cloneNode } from '@babel/types'
import { printTitle, printWarning } from './shared.js'

export const Inline = {
    VariableDeclaration(js, path) {
        const decl = path.node
        let opt
        switch (false) {
            case decl.trailingComments?.[0]?.type === 'CommentLine':
            case (opt = decl.trailingComments?.[0]?.value?.match(/^ \.Inline(?:\((\d+)\))?$/)) ?? false:
            case decl.kind === 'const':
            case decl.declarations.length === 1:
                return
        }
        const N = opt[1] ? parseInt(opt[1]) : 1
        printTitle(`Michikoid found Inline(${N})`)
        console.log(js.slice(decl.start, decl.trailingComments[0].end))

        const { name } = decl.declarations[0].id
        const binding = path.scope.getBinding(name)
        if (!binding.referenced) {
            printWarning('Not referenced, skipping')
            return
        }
        else if (binding.references !== N) {
            printWarning(`Want ${N} references, got ${binding.references} instead, skipping`)
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
