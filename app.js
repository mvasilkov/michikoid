#!/usr/bin/env node

/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024 Mark Vasilkov
 */
'use strict'

import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { argv, stdout } from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { ModuleKind, Project, ScriptTarget } from 'ts-morph'

import { expandAlias } from './features/alias.js'
import { expandDeadCode } from './features/deadcode.js'
import { expandInlineExp } from './features/inlineexp.js'
import { setProjectDir } from './features/shared.js'

const existingFeatures = new Set(['alias', 'deadcode', 'inlineexp'])

/**
 * @param {import('ts-morph').SourceFile[]} sourceFiles
 */
export function expandMacros(sourceFiles, features) {
    features = features ?? existingFeatures.reduce((acc, feat) =>
        ((acc[feat] = true), acc), Object.create(null))

    sourceFiles.forEach(file => {
        if (features.alias) expandAlias(file)
        if (features.deadcode) expandDeadCode(file)
        if (features.inlineexp) expandInlineExp(file)
    })
}

/**
 * @param {string} text
 * @returns {string}
 */
export function expandMacrosInString(text, filePath = 'infile.ts', features) {
    const project = new Project({
        compilerOptions: {
            target: ScriptTarget.ES2021,
            module: ModuleKind.ES2022,
        },
        useInMemoryFileSystem: true,
    })

    const infile = project.createSourceFile(filePath, text)
    expandMacros([infile], features)

    return infile.getFullText()
}

/**
 * @param {string} projectFile
 * @param {string} outDir
 */
function main(projectFile, outDir, features) {
    projectFile = resolve(projectFile)
    outDir = resolve(outDir)

    if (!statSync(projectFile).isFile()) {
        console.error(`${projectFile} is not a file`)
        return
    }

    const outStats = statSync(outDir, { throwIfNoEntry: false })
    if (outStats && !outStats.isDirectory()) {
        console.error(`${outDir} exists and is not a directory`)
        return
    }

    if (!outStats) {
        mkdirSync(outDir, { recursive: true })
    }

    console.error(`Loading project file: ${projectFile}`)

    const project = new Project({
        tsConfigFilePath: projectFile,
    })

    const diagnostics = project.getPreEmitDiagnostics()
    if (diagnostics.length) {
        console.error(project.formatDiagnosticsWithColorAndContext(diagnostics))
        return
    }

    const projectDir = dirname(projectFile)
    setProjectDir(projectDir)

    const sourceFiles = project.getSourceFiles()
    expandMacros(sourceFiles, features)

    /**
     * Keep track of directories we've created.
     * @type {Record<string, boolean>}
     */
    const dirCache = Object.create(null)
    dirCache[outDir] = true

    sourceFiles.forEach(file => {
        const relativePath = relative(projectDir, file.getFilePath())
        console.error(`Writing: ${relativePath}`)

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
    console.error('Usage: michikoid [--enable <features>] --project <tsconfig> <out_dir>')
    console.error('       michikoid [--enable <features>] <file>')
}

if (cli()) {
    const args = argv.slice(2)
    if (args.length > 2 && args[0] === '--enable') {
        const enable = args[1].split(',')
        const features = Object.create(null)
        for (const feat of enable) {
            if (existingFeatures.has(feat)) features[feat] = true
            else {
                console.error(`Expected feature to be one of: ${Array.from(existingFeatures).join(', ')}`)
                process.exit()
            }
        }

        args.splice(0, 2)
    }

    switch (args.length) {
        case 1: // <file>
            let infile = args.pop()
            if (infile === '-h' || infile === '--help') {
                usage()
                break
            }
            if (infile === '-v' || infile === '--version') {
                const packagePath = resolve(fileURLToPath(import.meta.url), '../package.json')
                const packageFile = JSON.parse(readFileSync(packagePath, { encoding: 'utf8' }))
                console.error(packageFile.version)
                break
            }
            infile = resolve(infile)

            if (!statSync(infile).isFile()) {
                console.error(`${infile} is not a file`)
                break
            }

            const text = readFileSync(infile, { encoding: 'utf8' })
            const out = expandMacrosInString(text, basename(infile), features)
            stdout.write(out)
            break

        case 3: // --project <tsconfig> <out_dir>
            const p = args.shift()
            if (p === '-p' || p === '--project') main(...args, features)
            else usage()
            break

        default:
            usage()
    }
}
