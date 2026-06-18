import fs from 'fs'
import path from 'path'

const BASE = path.join(process.cwd(), 'data/onet/db_30_3_text')
const OUT = path.join(process.cwd(), 'lib/data/onet-lookup.json')

function parseTsv(file: string): Record<string, string>[] {
  const text = fs.readFileSync(path.join(BASE, file), 'utf-8')
  const lines = text.trim().split(/\r?\n/)
  const headers = lines[0].split('\t').map(h => h.trim())
  return lines.slice(1).map(line => {
    const cols = line.split('\t')
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]))
  })
}

const occupations = parseTsv('Occupation Data.txt')
const workStyles = parseTsv('Work Styles.txt')
const jobTitles = parseTsv('Job Titles.txt')

// socCode → { elementName → WI value }
const wsMap = new Map<string, Record<string, number>>()
for (const row of workStyles) {
  if (row['Scale ID'] !== 'WI') continue
  const soc = row['O*NET-SOC Code']
  const element = row['Element Name']
  const value = parseFloat(row['Data Value'])
  if (!wsMap.has(soc)) wsMap.set(soc, {})
  wsMap.get(soc)![element] = Math.round(value * 100) / 100
}

// socCode → Set<string> of alternate titles (including short forms like "CFO")
const altMap = new Map<string, Set<string>>()
for (const row of jobTitles) {
  const soc = row['O*NET-SOC Code']
  const title = row['Job Title']
  const short = row['Short Title']
  if (!altMap.has(soc)) altMap.set(soc, new Set())
  if (title) altMap.get(soc)!.add(title)
  if (short && short !== 'n/a') altMap.get(soc)!.add(short)
}

const result = {
  version: '30.3',
  occupations: occupations
    .map(occ => {
      const soc = occ['O*NET-SOC Code']
      const ws = wsMap.get(soc)
      if (!ws) return null
      return {
        socCode: soc,
        title: occ['Title'],
        alternateTitles: [...(altMap.get(soc) ?? [])],
        workStyles: ws,
      }
    })
    .filter(Boolean),
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(result))
console.log(`Written ${result.occupations.length} occupations → ${OUT}`)
console.log(`File size: ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`)
