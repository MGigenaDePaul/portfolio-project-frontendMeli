// src/search/auriculares.js
import { tokenize } from './normalize'
import { matchesPathPrefix } from './categoryMatch'
import { buildSearchText } from './text'

const headphoneKeywords = new Set([
  'auricular',
  'auris',
  'auriculares',
  'headphone',
  'headphones',
  'in ear',
  'inear',
  'over ear',
  'supraaural',
])

// Tipos de auriculares
const inEarKeywords = new Set(['in ear', 'inear', 'in-ear'])
const overEarKeywords = new Set([
  'over ear',
  'overear',
  'over-ear',
  'supraaural',
])
const wirelessKeywords = new Set([
  'inalambrico',
  'inalambricos',
  'wireless',
  'bluetooth',
  'bt',
])
const wiredKeywords = new Set(['con cable', 'cableado', 'wired'])

// Marcas comunes de auriculares
const headphoneBrands = new Set([
  'sony',
  'samsung',
  'apple',
  'airpods',
  'jbl',
  'bose',
  'sennheiser',
  'beats',
  'skullcandy',
  'audio-technica',
  'hyperx',
  'razer',
  'logitech',
])

const extractHeadphoneBrand = (tokens) => {
  return tokens.find((t) => headphoneBrands.has(t)) || null
}

const extractHeadphoneType = (tokens, joined) => {
  if (tokens.some((t) => inEarKeywords.has(t))) return 'in-ear'
  if (tokens.some((t) => overEarKeywords.has(t))) return 'over-ear'
  return null
}

const extractConnectivity = (tokens) => {
  const hasWireless = tokens.some((t) => wirelessKeywords.has(t))
  const hasWired = tokens.some((t) => wiredKeywords.has(t))

  if (hasWireless) return 'wireless'
  if (hasWired) return 'wired'
  return null
}

// ✅ Detectar si la query es sobre auriculares
export const isHeadphoneQuery = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => headphoneKeywords.has(t))
}

// ✅ Parsear specs de la query
export const parseHeadphoneQuery = (q) => {
  const tokens = tokenize(q)
  const joined = tokens.join(' ')

  const brand = extractHeadphoneBrand(tokens)
  const type = extractHeadphoneType(tokens, joined)
  const connectivity = extractConnectivity(tokens)

  return { brand, type, connectivity }
}

// ✅ Detectar si un producto es auricular
export const isHeadphoneProduct = (product) => {
  // Fuerte por categoría
  if (matchesPathPrefix(product, ['tecnologia', 'auriculares'])) return true

  // Fallback por texto
  const text = buildSearchText(product)
  return (
    text.includes('auricular') ||
    text.includes('auriculares') ||
    text.includes('headphone') ||
    text.includes('headphones') ||
    text.includes('in ear') ||
    text.includes('over ear')
  )
}

// ✅ Matcher (opcional, para filtrar por specs)
export const matchesHeadphoneSpecs = (product, specs = {}) => {
  if (!isHeadphoneProduct(product)) return false

  const text = buildSearchText(product)

  if (specs.brand && !text.includes(specs.brand)) return false

  if (specs.type) {
    if (
      specs.type === 'in-ear' &&
      !text.includes('in ear') &&
      !text.includes('inear')
    ) {
      return false
    }
    if (
      specs.type === 'over-ear' &&
      !text.includes('over ear') &&
      !text.includes('supraaural')
    ) {
      return false
    }
  }

  if (specs.connectivity) {
    if (
      specs.connectivity === 'wireless' &&
      !text.includes('bluetooth') &&
      !text.includes('inalambrico') &&
      !text.includes('wireless')
    ) {
      return false
    }
    if (
      specs.connectivity === 'wired' &&
      !text.includes('cable') &&
      !text.includes('wired')
    ) {
      return false
    }
  }

  return true
}

export const headphoneDropTokens = new Set([
  ...headphoneKeywords,
  ...wirelessKeywords,
  ...wiredKeywords,
  'para',
])
