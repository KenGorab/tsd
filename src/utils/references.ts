import { EOL } from 'os'
import { resolve, relative, isAbsolute, normalize } from 'path'

/**
 * Match reference tags in a file. Matching the newline before the
 * reference to remove unwanted data when removing the line from the file.
 */
const REFERENCE_REGEXP = /[ \t]*\/\/\/[ \t]*<reference[ \t]+path=(["'])([^'"]*)\1[ \t]*\/>[ \t]*\r?\n?/gm

/**
 * References come back in a semi-useful structure to enable slicing them
 * from the source code that was passed in.
 */
export interface Reference {
  start: number
  end: number
  path: string
}

export function extractReferences (contents: string, cwd: string): Reference[] {
  const refs: Reference[] = []
  let m: any

  while ((m = REFERENCE_REGEXP.exec(contents)) != null) {
    refs.push({
      start: m.index,
      end: m.index + m[0].length,
      path: resolve(cwd, m[2])
    })
  }

  return refs
}

export function parseReferences (contents: string, cwd: string): string[] {
  return extractReferences(contents, cwd).map(ref => ref.path)
}

export function stringifyReferences (paths: string[], cwd: string): string {
  return paths.map(path => toReference(path, cwd)).join(EOL) + EOL
}

export function toReference (path: string, cwd: string): string {
  return `/// <reference path="${isAbsolute(path) ? relative(cwd, path) : normalize(path)}" />`
}
