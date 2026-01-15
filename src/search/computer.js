// src/search/computer.js
import { tokenize } from './normalize'

const notebookWords = new Set([
  'notebook', 'notebooks', 'laptop', 'laptops', 'macbook', 'ultrabook',
])

const pcWords = new Set([
  'pc', 'pcs', 'desktop', 'escritorio', 'cpu', 'torre', 'gabinete', 'computadora', 'computadoras',
])

const computerBrands = new Set([
  'lenovo','hp','dell','asus','acer','apple','msi','gigabyte','samsung',
])

export const isNotebookIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => notebookWords.has(t))
}

export const isPcIntent = (q) => {
  const tokens = tokenize(q)
  // si es notebook/laptop/macbook, no caer en pc
  if (tokens.some((t) => notebookWords.has(t))) return false
  return tokens.some((t) => pcWords.has(t))
}

export const parseComputerQuery = (q) => {
  const raw = q || ''
  const tokens = tokenize(raw)

  // brand
  let brand = null
  for (const t of tokens) {
    if (computerBrands.has(t)) {
      brand = t
      break
    }
    if (t === 'macbook') brand = 'apple'
  }

  // ram (16gb / 16 gb)
  let ramGB = null
  const ramMatch = raw.match(/(\d{1,3})\s?gb\b/i)
  if (ramMatch) {
    const n = Number(ramMatch[1])
    if ([4,8,16,32,64,128].includes(n)) ramGB = n
  }

  // storage (512gb / 1tb)
  let storage = null
  const stMatch = raw.match(/(\d{1,4})\s?(gb|tb)\b/i)
  if (stMatch) storage = { value: Number(stMatch[1]), unit: stMatch[2].toLowerCase() }

  // cpu
  let cpu = null
  const intel = raw.match(/\b(i[3579])\b/i)
  const ryzen = raw.match(/\bryzen\s?([3579])\b/i)
  if (intel) cpu = { brand: 'intel', tier: intel[1].toLowerCase() }
  else if (ryzen) cpu = { brand: 'amd', tier: `ryzen${ryzen[1]}` }

  return { brand, ramGB, storage, cpu }
}
