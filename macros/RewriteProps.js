/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */

import { printTitle, printWarning } from './shared.js'

export const RewriteProps = {
    BlockStatement(js, path) {
        const decl = path.node
        const firstComment = decl.body[0]?.leadingComments?.[0]
        let opt
        switch (false) {
            case firstComment?.type === 'CommentLine':
            case (opt = firstComment.value?.match(/^ \.RewriteProps\((.*?)\)$/)) ?? false:
                return
        }
        printTitle('Michikoid found RewriteProps')
        console.log(js.slice(firstComment.start, firstComment.end))

        const propMap = Object.fromEntries(opt[1].split(', ').map(kv => kv.split('=')))

        if (Object.keys(propMap).length === 0) {
            printWarning('No properties, skipping')
            return
        }

        path.traverse({
            MemberExpression(path) {
                const { property } = path.node
                if (property.type === 'Identifier') {
                    if (propMap.hasOwnProperty(property.name)) {
                        property.name = propMap[property.name]
                    }
                }
                else if (property.type === 'StringLiteral') {
                    if (propMap.hasOwnProperty(property.value)) {
                        property.value = propMap[property.value]
                    }
                }
            }
        })

        decl.body[0].leadingComments.shift()
    },
}
