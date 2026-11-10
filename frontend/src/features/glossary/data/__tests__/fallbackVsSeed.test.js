import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { GLOSSARY_FALLBACK } from '../glossaryFallback'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// __dirname is <workspace>/frontend/src/features/glossary/data/__tests__
// 6 levels up is <workspace>
const MIGRATIONS_DIR = path.resolve(
  __dirname,
  '../../../../../../backend/src/main/resources/db/migration'
)

/**
 * Extracts term names from INSERT INTO glossary_terms ... VALUES rows.
 * Pattern: ('term-N', 'TERM NAME', ...)
 */
function extractTermNamesFromSql(sqlContent) {
  const regex = /\('term-\d+',\s*'([^']+)'/g
  const names = []
  let match
  while ((match = regex.exec(sqlContent)) !== null) {
    names.push(match[1])
  }
  return names
}

describe('Glossary fallback vs SQL seed parity', () => {
  it('every term from every SQL migration is present in the fallback', () => {
    expect(fs.existsSync(MIGRATIONS_DIR)).toBe(true)

    const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))
    expect(sqlFiles.length).toBeGreaterThan(0)

    const seedTermNames = new Set()
    for (const file of sqlFiles) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      extractTermNamesFromSql(content).forEach((n) => seedTermNames.add(n))
    }

    const fallbackTermNames = new Set(GLOSSARY_FALLBACK.map((t) => t.term))

    for (const name of seedTermNames) {
      expect(
        fallbackTermNames.has(name),
        `Term "${name}" is in a SQL migration but MISSING from GLOSSARY_FALLBACK`
      ).toBe(true)
    }
  })

  it('no extra terms in the fallback that are absent from SQL migrations', () => {
    const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))
    const seedTermNames = new Set()
    for (const file of sqlFiles) {
      const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      extractTermNamesFromSql(content).forEach((n) => seedTermNames.add(n))
    }

    const fallbackTermNames = GLOSSARY_FALLBACK.map((t) => t.term)
    for (const name of fallbackTermNames) {
      expect(
        seedTermNames.has(name),
        `Term "${name}" is in GLOSSARY_FALLBACK but NOT found in any SQL migration`
      ).toBe(true)
    }
  })

  it('every fallback entry has id, term, shortDefinition and category', () => {
    for (const entry of GLOSSARY_FALLBACK) {
      expect(entry.id, `${entry.term}: missing id`).toBeTruthy()
      expect(entry.term, `entry missing term name`).toBeTruthy()
      expect(entry.shortDefinition, `${entry.term}: missing shortDefinition`).toBeTruthy()
      expect(entry.category, `${entry.term}: missing category`).toBeTruthy()
    }
  })

  it('every fallback entry has a detailedExplainer (complete fallback goal)', () => {
    for (const entry of GLOSSARY_FALLBACK) {
      expect(
        entry.detailedExplainer,
        `${entry.term}: missing detailedExplainer — add it from the SQL migration`
      ).toBeTruthy()
    }
  })
})
