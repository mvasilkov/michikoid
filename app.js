#!/usr/bin/env node

import { argv } from 'node:process'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { parse } from '@babel/parser'
import pkg from '@babel/generator'

const { default: generate } = pkg

function main() {
    argv.slice(2).forEach(a => {
        a = resolve(a)

        if (!fs.statSync(a).isFile()) {
            console.log(`${a} is not a file`)
            return
        }

        const js = fs.readFileSync(a, 'utf-8')
        const ast = parse(js, {
            sourceType: 'module',
        })
        const result = generate(ast, {}, js)

        fs.writeFileSync(a, result.code, 'utf-8')
    })
}

main()
