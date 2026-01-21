import { tokenize, stem, stemTokens, normalize } from './normalize'
import { buildSearchText } from './text'
import { matchesPathPrefix } from './categoryMatch'

// Crear el Set con versiones stemmed
const createStemmedSet = (words) => {
  const stemmedSet = new Set()
  words.forEach((word) => {
    stemmedSet.add(word) // original
    stemmedSet.add(stem(word)) // stemmed
  })
  return stemmedSet
}

const remeraWords = createStemmedSet([
  'remera',
  'remeras',
  'camiseta',
  'camisetas',
  'playera',
  'playeras',
  'tshirt',
  'tshirts',
  't-shirt',
  't-shirts',
  'tee',
  'tees',
])

// Lo mismo para palabras negativas
const negativeWords = createStemmedSet([
  'buzo',
  'hoodie',
  'campera',
  'abrigo',
  'sweater',
  'sueter',
  'pantalon',
  'jean',
  'jogger',
  'short',
  'bermuda',
  'zapatilla',
  'calzado',
  'botin',
  'botines',
])

const brandAliases = new Map([
  ['nike', 'nike'],
  ['adidas', 'adidas'],
  ['puma', 'puma'],
  ['reebok', 'reebok'],
  ['fila', 'fila'],
  ['vans', 'vans'],
  ['levis', 'levis'],
  ['levi', 'levis'],
  ['tommy', 'tommy'],
  ['tommyhilfiger', 'tommy'],
  ['underarmour', 'under armour'],
  ['under', 'under armour'],
  ['armour', 'under armour'],
  ['newbalance', 'new balance'],
  ['nb', 'new balance'],
  ['zara', 'zara'],
  ['hm', 'hm'],
  ['hym', 'hm'],
])

const colorAliases = new Map([
  ['negro', 'negro'],
  ['black', 'negro'],
  ['blanco', 'blanco'],
  ['white', 'blanco'],
  ['gris', 'gris'],
  ['gray', 'gris'],
  ['grey', 'gris'],
  ['rojo', 'rojo'],
  ['red', 'rojo'],
  ['azul', 'azul'],
  ['blue', 'azul'],
  ['verde', 'verde'],
  ['green', 'verde'],
  ['celeste', 'celeste'],
  ['amarillo', 'amarillo'],
  ['yellow', 'amarillo'],
  ['rosa', 'rosa'],
  ['pink', 'rosa'],
  ['beige', 'beige'],
  ['arena', 'beige'],
  ['marron', 'marron'],
  ['marrón', 'marron'],
  ['brown', 'marron'],
  ['bordo', 'bordo'],
  ['bordó', 'bordo'],
])

const materialAliases = new Map([
  ['algodon', 'algodon'],
  ['algodón', 'algodon'],
  ['cotton', 'algodon'],
  ['poliester', 'poliester'],
  ['polyester', 'poliester'],
  ['lino', 'lino'],
  ['linen', 'lino'],
  ['modal', 'modal'],
  ['viscosa', 'viscosa'],
  ['rayon', 'viscosa'],
  ['lycra', 'lycra'],
  ['elastano', 'elastano'],
  ['spandex', 'elastano'],
])

// helpers
const hasShortSleeve = (text = '') =>
  /\bmanga\s*corta\b/.test(text) || /\bshort\s*sleeve\b/.test(text)

const hasLongSleeve = (text = '') =>
  /\bmanga\s*larga\b/.test(text) || /\blong\s*sleeve\b/.test(text)

export const extractGender = (text = '') => {
  const normalizedText = normalize(text)
  const stemmedTokens = stemTokens(text)
  const stemmedJoined = stemmedTokens.join(' ')

  // 🔍 DEBUG - eliminá esto después de probar
  console.log('🔍 extractGender DEBUG:')
  console.log('  - original:', text)
  console.log('  - normalized:', normalizedText)
  console.log('  - stemmedTokens:', stemmedTokens)
  console.log('  - stemmedJoined:', stemmedJoined)

  if (/\bunisex\b/.test(normalizedText)) return 'unisex'

  if (/\b(para\s+)?(hombre|varon|masculin|men)\b/i.test(stemmedJoined)) {
    console.log('  ✅ Matched MALE')
    return 'male'
  }
  if (/\b(para\s+)?(mujer|dama|femenin|women|ladies)\b/i.test(stemmedJoined)) {
    console.log('  ✅ Matched FEMALE')
    return 'female'
  }
  if (/\b(para\s+)?(nino|nina|kid|infantil|juvenil)\b/i.test(stemmedJoined)) {
    console.log('  ✅ Matched KIDS')
    return 'kids'
  }

  console.log('  ❌ No gender matched')
  return null
}

const extractSeason = (text = '') => {
  if (/\b(verano|summer)\b/.test(text)) return 'summer'
  if (/\b(invierno|winter)\b/.test(text)) return 'winter'
  if (/\b(primavera|spring)\b/.test(text)) return 'spring'
  if (/\b(otono|otoño|autumn|fall)\b/.test(text)) return 'autumn'

  // Comentá estas líneas - no infieras temporada por manga
  // if (hasShortSleeve(text)) return 'summer'
  // if (hasLongSleeve(text)) return 'winter'

  return null
}

const extractColors = (tokens, joined) => {
  const colors = []
  for (const t of tokens) {
    if (colorAliases.has(t)) {
      const c = colorAliases.get(t)
      if (!colors.includes(c)) colors.push(c)
    }
  }
  if (/\bazul\s*marino\b/.test(joined) && !colors.includes('azul'))
    colors.push('azul')
  if (/\bgris\s*oscuro\b/.test(joined) && !colors.includes('gris'))
    colors.push('gris')
  return colors
}

const extractMaterials = (tokens) => {
  const mats = []
  for (const t of tokens) {
    if (materialAliases.has(t)) {
      const m = materialAliases.get(t)
      if (!mats.includes(m)) mats.push(m)
    }
  }
  return mats
}

const extractBrand = (tokens, joined) => {
  for (const t of tokens) if (brandAliases.has(t)) return brandAliases.get(t)

  // fallback por texto completo por si vino raro (ej "nike," "nike.")
  for (const [k, v] of brandAliases.entries()) {
    if (new RegExp(`\\b${k}\\b`).test(joined)) return v
  }
  return null
}

// -------------------- intent detection --------------------
export const isRemeraQuery = (q) => {
  const tokens = stemTokens(q)
  const joined = tokens.join(' ')
  const hasWord = tokens.some((t) => remeraWords.has(t))
  const hasNegative = tokens.some((t) => negativeWords.has(t))
  if (hasNegative && !hasWord) return false

  const hasSignals =
    hasWord ||
    hasShortSleeve(joined) ||
    hasLongSleeve(joined) ||
    Boolean(extractGender(joined)) ||
    Boolean(extractSeason(joined))

  return hasSignals
}

// -------------------- product detection --------------------
export const isRemeraProduct = (product) => {
  if (matchesPathPrefix(product, ['ropa', 'remeras'])) return true
  const text = buildSearchText(product)

  const looks =
    text.includes('remera') ||
    text.includes('camiseta') ||
    text.includes('tshirt') ||
    text.includes('t-shirt') ||
    text.includes('tee')

  if (!looks) return false
  for (const w of negativeWords) if (text.includes(w)) return false
  return true
}

// -------------------- parser --------------------
export const parseRemeraQuery = (q) => {
  const normalizedText = normalize(q)
  const tokens = tokenize(q)
  const stemmedTokens = stemTokens(q) // ✅ Agregar esto
  const joined = stemmedTokens.join(' ') // ✅ Usar stemmed

  const brand = extractBrand(tokens, joined)

  let sleeve = null
  if (hasShortSleeve(normalizedText)) sleeve = 'short'
  else if (hasLongSleeve(normalizedText)) sleeve = 'long'

  const gender = extractGender(normalizedText) // ✅ Esto ahora usará stem internamente
  const season = extractSeason(normalizedText)

  const colors = extractColors(stemmedTokens, joined) // ✅ Usar stemmed
  const materials = extractMaterials(stemmedTokens) // ✅ Usar stemmed

  return { brand, sleeve, gender, season, colors, materials }
}

// -------------------- matcher --------------------
// DURO: remera + marca (si la pidio)
// SUAVE: genero/temporada/color/material (no matan si el producto no lo declara)
// -------------------- matcher --------------------
export const matchesRemeraSpecs = (product, specs = {}) => {
  if (!isRemeraProduct(product)) return false
  const text = buildSearchText(product)

  // 🔍 DEBUG
  console.log('=== matchesRemeraSpecs DEBUG ===')
  console.log('Product title:', product.title)
  console.log('Product text:', text)
  console.log('Specs:', specs)
  if (specs.brand && !text.includes(specs.brand)) return false

  // ✅ MANGA: HACERLO MÁS ESTRICTO
  if (specs.sleeve) {
    const hasShort = hasShortSleeve(text)
    const hasLong = hasLongSleeve(text)

    // Si el producto no declara tipo de manga, rechazarlo
    if (!hasShort && !hasLong) return false

    // Si declara el tipo de manga, debe coincidir con lo pedido
    if (specs.sleeve === 'short' && !hasShort) return false
    if (specs.sleeve === 'long' && !hasLong) return false
  }

  // ✅ GÉNERO: HACERLO MÁS ESTRICTO
  // ✅ GÉNERO: MATCH EXACTO (unisex NO sirve para géneros específicos)
  if (specs.gender) {
    const g = extractGender(text)

    console.log('  - Product gender:', g)
    console.log('  - Query gender:', specs.gender)

    if (!g) {
      console.log('  ❌ Product has no gender')
      return false
    }

    // Match exacto: male solo acepta male, female solo acepta female, unisex solo acepta unisex
    if (g !== specs.gender) {
      console.log('  ❌ Gender mismatch')
      return false
    }

    console.log('  ✅ Gender match!')
  }

  // ✅ TEMPORADA: HACERLO ESTRICTO
  if (specs.season) {
    const s = extractSeason(text)

    // Si el producto no declara temporada, rechazarlo
    if (!s) return false

    // Si declara temporada, debe coincidir
    if (s !== specs.season) {
      console.log(
        `   ❌ Season conflict: product has ${s}, query needs ${specs.season}`,
      )
      return false
    }
  }

  // ✅ COLOR: HACERLO ESTRICTO
  if (specs.colors?.length) {
    // Verificar que el producto tenga TODOS los colores pedidos
    for (const c of specs.colors) {
      if (!text.includes(c)) return false
    }
  }

  // ✅ MATERIAL: HACERLO ESTRICTO (opcional, depende de tu preferencia)
  if (specs.materials?.length) {
    // Verificar que el producto tenga TODOS los materiales pedidos
    for (const m of specs.materials) {
      if (!text.includes(m)) return false
    }
  }

  return true
}

export const remeraDropTokens = new Set([
  ...remeraWords,
  'para',
  'temporada',
  'verano',
  'invierno',
  'primavera',
  'otono',
  'otoño',
  'hombre',
  'mujer',
  'dama',
  'unisex',
  'kids',
  'infantil',
  'juvenil',
  'manga',
  'corta',
  'larga',
  ...Array.from(colorAliases.keys()),
  ...Array.from(materialAliases.keys()),
])
