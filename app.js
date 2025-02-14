#!/usr/bin/env node

/** This file is part of Michikoid.
 * https://github.com/mvasilkov/michikoid
 * @license MIT | Copyright (c) 2023, 2024, 2025 Mark Vasilkov
 */
'use strict'

import { mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { argv, stdout } from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

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
    features = features ?? Array.from(existingFeatures).reduce((acc, feat) =>
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
            target: ScriptTarget.ES2023,
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
function michikoidMain(projectFile, outDir, features) {
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
    console.error(`Features: ${Array.from(existingFeatures).join(', ')}`)
}

if (cli()) {
    const flags = parseArgs({
        allowPositionals: true,
        options: {
            enable: { type: 'string' },
            project: { type: 'string', short: 'p' },
            help: { type: 'boolean', short: 'h' },
            version: { type: 'boolean', short: 'v' },
        },
        strict: true,
    })

    let features = null
    if ('enable' in flags.values) {
        features = Object.create(null)
        const enable = flags.values.enable.split(',')
        for (const feat of enable) {
            if (existingFeatures.has(feat)) features[feat] = true
            else {
                console.error(`Expected feature to be one of: ${Array.from(existingFeatures).join(', ')}`)
                process.exit()
            }
        }
    }

    if (flags.values.help) {
        usage()
        process.exit()
    }

    if (flags.values.version) {
        const packagePath = resolve(fileURLToPath(import.meta.url), '../package.json')
        const packageFile = JSON.parse(readFileSync(packagePath, { encoding: 'utf8' }))
        console.error(`Michikoid version ${packageFile.version}`)
        process.exit()
    }

    let infile = flags.positionals.pop()
    if (!infile || flags.positionals.length) {
        usage()
        process.exit()
    }

    // --project <tsconfig> <out_dir>
    if ('project' in flags.values) {
        michikoidMain(flags.values.project, infile, features)
    }
    // <file>
    else {
        infile = resolve(infile)

        if (!statSync(infile).isFile()) {
            console.error(`${infile} is not a file`)
            process.exit()
        }

        const text = readFileSync(infile, { encoding: 'utf8' })
        const out = expandMacrosInString(text, basename(infile), features)
        stdout.write(out)
    }
}
