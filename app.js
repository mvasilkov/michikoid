#!/usr/bin/env node

/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { argv, stdout } from 'node:process'
import { pathToFileURL } from 'node:url'

import { ModuleKind, Project, ScriptTarget } from 'ts-morph'

import { expandAlias } from './features/alias.js'
import { expandDeadCode } from './features/deadcode.js'
import { expandInlineExp } from './features/inlineexp.js'

/**
 * @param {import('ts-morph').SourceFile[]} sourceFiles
 */
export function expandMacros(sourceFiles) {
    sourceFiles.forEach(file => {
        expandAlias(file)
        expandDeadCode(file)
        expandInlineExp(file)
    })
}

/**
 * @param {string} text
 * @returns {string}
 */
export function expandMacrosInString(text, filePath = 'infile.ts') {
    const project = new Project({
        compilerOptions: {
            target: ScriptTarget.ES2021,
            module: ModuleKind.ES2022,
        },
        useInMemoryFileSystem: true,
    })

    const infile = project.createSourceFile(filePath, text)
    expandMacros([infile])

    return infile.getFullText()
}

/**
 * @param {string} projectFile
 * @param {string} outDir
 */
function main(projectFile, outDir) {
    projectFile = resolve(projectFile)
    outDir = resolve(outDir)

    if (!statSync(projectFile).isFile()) {
        console.log(`${projectFile} is not a file`)
        return
    }

    const outStats = statSync(outDir, { throwIfNoEntry: false })
    if (outStats && !outStats.isDirectory()) {
        console.log(`${outDir} exists and is not a directory`)
        return
    }

    if (!outStats) {
        mkdirSync(outDir, { recursive: true })
    }

    console.log(`Loading project file: ${projectFile}`)

    const project = new Project({
        tsConfigFilePath: projectFile,
    })

    const diagnostics = project.getPreEmitDiagnostics()
    if (diagnostics.length) {
        console.log(project.formatDiagnosticsWithColorAndContext(diagnostics))
        return
    }

    const sourceFiles = project.getSourceFiles()
    expandMacros(sourceFiles)

    /**
     * Keep track of directories we've created.
     * @type {Record<string, boolean>}
     */
    const dirCache = Object.create(null)
    dirCache[outDir] = true

    const projectDir = dirname(projectFile)
    sourceFiles.forEach(file => {
        const relativePath = relative(projectDir, file.getFilePath())
        console.log(`Writing: ${relativePath}`)

        const outPath = resolve(outDir, relativePath)

        // Make sure the subdirectories exist.
        const d = dirname(outPath)
        if (!dirCache[d]) {
            mkdirSync(d, { recursive: true })
            dirCache[d] = true
        }

        writeFileSync(outPath, file.getFullText(), { encoding: 'utf8' })
    })
}

/** Is this script being run as an executable? */
function cli() {
    const path = realpathSync(argv[1])
    const url = pathToFileURL(path).href
    return import.meta.url === url
}

function usage() {
    console.log('Usage: michikoid --project <tsconfig> <out_dir>')
    console.log('       michikoid <file>')
}

if (cli()) {
    const args = argv.slice(2)
    switch (args.length) {
        case 1: // <file>
            let infile = args.pop()
            if (infile === '-h' || infile === '--help') {
                usage()
                break
            }
            infile = resolve(infile)

            if (!statSync(infile).isFile()) {
                console.log(`${infile} is not a file`)
                break
            }

            const text = readFileSync(infile, { encoding: 'utf8' })
            const out = expandMacrosInString(text, basename(infile))
            stdout.write(out)
            break

        case 3: // --project <tsconfig> <out_dir>
            const p = args.shift()
            if (p === '-p' || p === '--project') main(...args)
            else usage()
            break

        default:
            usage()
    }
}
