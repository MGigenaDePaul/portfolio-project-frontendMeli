export const normalize = (str = '') =>
  String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca tildes

const vehicleKeywords = new Set([
  'auto',
  'autos',
  'vehiculo',
  'vehiculos',
  'camioneta',
  'camionetas',
  'moto',
  'motos',
  'pickup',
  'pickups',
  'camion',
  'camiones',
])

export const isVehicleIntent = (q) => {
  // split simple por espacios
  const tokens = q.split(/\s+/).filter(Boolean)
  return tokens.some((t) => vehicleKeywords.has(t))
}

// Detecta autos reales por categoria exacta (la que vos pediste)
export const isVehicleCategory = (product) => {
  const cats =
    product.category_path_from_root?.map((c) => normalize(c.name)) ?? []
  return (
    cats.length >= 3 &&
    cats[0] === 'autos' &&
    cats[1] === 'motos y otros' &&
    cats[2] === 'autos y camionetas'
  )
}

// Construye un texto "buscable" a partir de un producto
// combinando título, provincia y categorías, y lo normaliza
// para usarlo en el buscador
export const buildSearchText = (product) => {
  const title = product.title ?? ''
  const state = product.address?.state_name ?? ''
  const cats =
    product.category_path_from_root?.map((c) => c.name).join(' ') ?? ''

  return normalize(`${title} ${state} ${cats}`)
}

/*------------------------------ */
const tokenize = (q = '') => normalize(q).split(/\s+/).filter(Boolean)

// --- CAMERAS ---
const cameraKeywords = new Set(['camara', 'camaras', 'camera', 'cameras'])
const securityKeywords = new Set([
  'seguridad',
  'security',
  'cctv',
  'vigilancia',
])

export const isCameraIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => cameraKeywords.has(t))
}

export const isSecurityModifier = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => securityKeywords.has(t))
}

// Detecta si un producto es “cámara de seguridad” por texto (título/categorías/etc.)
export const isSecurityCameraProduct = (product) => {
  const text = buildSearchText(product) // ya incluye title+state+cats normalizado
  return (
    text.includes('seguridad') ||
    text.includes('security') ||
    text.includes('cctv') ||
    text.includes('vigilancia')
  )
}

// productos que SON cámaras (no accesorios random)
export const isCameraProduct = (product) => {
  const text = buildSearchText(product)

  const hasCameraWord =
    text.includes('camara') ||
    text.includes('camaras') ||
    text.includes('camera') ||
    text.includes('cameras')

  if (!hasCameraWord) return false

  // Opcional: excluir celulares explícitamente
  const looksLikePhone =
    text.includes('celular') ||
    text.includes('telefono') ||
    text.includes('smartphone') ||
    text.includes('iphone') ||
    text.includes('samsung') ||
    text.includes('xiaomi') ||
    text.includes('motorola')

  if (looksLikePhone) return false

  return true
}

// --- AUTOS / MARCAS ---
const carBrands = new Set([
  'toyota',
  'ford',
  'chevrolet',
  'fiat',
  'renault',
  'volkswagen',
  'vw',
  'peugeot',
  'citroen',
  'honda',
  'nissan',
  'bmw',
  'audi',
  'mercedes',
  'jeep',
  'kia',
  'hyundai',
])

export const extractCarBrand = (q) => {
  const tokens = tokenize(q)
  // si el usuario pone "vw" lo normalizamos a "volkswagen" opcionalmente
  if (tokens.includes('vw')) return 'volkswagen'
  return tokens.find((t) => carBrands.has(t)) || null
}

// --- MATCHING POR TOKENS (para "auto toyota", "camara de seguridad", etc.) ---
const stopwords = new Set([
  'de',
  'del',
  'la',
  'las',
  'el',
  'los',
  'un',
  'una',
  'unos',
  'unas',
  'y',
  'o',
  'para',
  'con',
  'sin',
  'en',
  'por',
  'a',
])

const genericWords = new Set([
  'tecnologia',
  'tecnologico',
  'tecnologica',
  'tech',
  'electronica',
  'electronico',
  'electronicos',
])

// Palabras que indican "intención" (no aportan a filtrar por producto concreto)
const intentWords = new Set([...vehicleKeywords, ...cameraKeywords])

const meaningfulTokens = (q) =>
  tokenize(q).filter(
    (t) => !stopwords.has(t) && !intentWords.has(t) && !genericWords.has(t),
  )

export const matchesQuery = (product, q) => {
  const tokens = meaningfulTokens(q)

  // si el user solo puso "autos" o "camaras" => tokens vacío
  // devolvemos true y que manden las reglas por intención en SearchResults.jsx
  if (tokens.length === 0) return true

  const text = buildSearchText(product)
  return tokens.every((t) => text.includes(t))
}

// --- ROPA (por categoría) ---
const clothingKeywords = new Set([
  'ropa',
  'remera',
  'remeras',
  'camisa',
  'camisas',
  'pantalon',
  'pantalones',
  'zapatilla',
  'zapatillas',
  'buzo',
  'buzos',
  'campera',
  'camperas',
  'vestido',
  'vestidos',
])

export const isClothingIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => clothingKeywords.has(t))
}

export const isClothingCategory = (product) => {
  const cats =
    product.category_path_from_root?.map((c) => normalize(c.name)) ?? []

  // Con tu ejemplo: ["ropa y accesorios", "ropa", "camisas", ...]
  return (
    cats.length >= 2 && cats[0] === 'ropa y accesorios' && cats[1] === 'ropa'
  )
}

// (Opcional) si querés excluir accesorios dentro de "Ropa y Accesorios" en el futuro,
// mantené esto con cats[1] === 'ropa' como arriba.

export const getClothingSubcategory = (q) => {
  const tokens = tokenize(q)

  // map “intención del usuario” -> nombre real de categoría (normalizado)
  const map = new Map([
    ['camisa', 'camisas'],
    ['camisas', 'camisas'],

    ['pantalon', 'pantalones'],
    ['pantalones', 'pantalones'],

    ['campera', 'camperas'],
    ['camperas', 'camperas'],

    ['remera', 'remeras'],
    ['remeras', 'remeras'],

    ['buzo', 'buzos'],
    ['buzos', 'buzos'],

    ['zapatilla', 'zapatillas'],
    ['zapatillas', 'zapatillas'],

    ['vestido', 'vestidos'],
    ['vestidos', 'vestidos'],
  ])

  for (const t of tokens) {
    if (map.has(t)) return map.get(t)
  }
  return null
}

export const isClothingSubcategory = (product, subcatNormalized) => {
  if (!subcatNormalized) return true
  const cats =
    product.category_path_from_root?.map((c) => normalize(c.name)) ?? []
  // cats[2] = "camisas" / "pantalones" / "camperas"...
  return cats.length >= 3 && cats[2] === subcatNormalized
}

// --- CARNES (por categoría real) ---
const meatKeywords = new Set([
  'carne',
  'carnes',
  'asado',
  'cordero',
  'vacuno',
  'res',
  'pollo',
  'cerdo',
  'bondiola',
  'milanesa',
  'hamburguesa',
  'hamburguesas',
  'chorizo',
  'salchicha',
])

export const isMeatIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => meatKeywords.has(t))
}

export const isMeatCategory = (product) => {
  const cats =
    product.category_path_from_root?.map((c) => normalize(c.name)) ?? []
  // ["alimentos y bebidas", "carnes", "cordero"]
  return (
    cats.length >= 2 &&
    cats[0] === 'alimentos y bebidas' &&
    cats[1] === 'carnes'
  )
}

// Subcategorías (3er nivel) - opcional
export const getMeatSubcategory = (q) => {
  const tokens = tokenize(q)

  const map = new Map([
    ['cordero', 'cordero'],
    ['vacuno', 'vacuno'],
    ['res', 'vacuno'],
    ['pollo', 'pollo'],
    ['cerdo', 'cerdo'],
    // si después tenés "pescados y mariscos" sería otra intención
  ])

  for (const t of tokens) {
    if (map.has(t)) return map.get(t)
  }
  return null
}

export const isMeatSubcategory = (product, subcatNormalized) => {
  if (!subcatNormalized) return true
  const cats =
    product.category_path_from_root?.map((c) => normalize(c.name)) ?? []
  return cats.length >= 3 && cats[2] === subcatNormalized
}

// --- BICICLETAS (por categoría real) ---
const bikeKeywords = new Set([
  'bici',
  'bicis',
  'bicicleta',
  'bicicletas',
  'mtb',
  'mountain',
  'ruta',
  'road',
  'bmx',
  'fixie',
  'plegable',
])

export const isBikeIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => bikeKeywords.has(t))
}

// Categoría exacta:
// ["deportes y fitness", "ciclismo", "bicicletas"]
export const isBikeCategory = (product) => {
  const cats =
    product.category_path_from_root?.map((c) => normalize(c.name)) ?? []

  return (
    cats.length >= 3 &&
    cats[0] === 'deportes y fitness' &&
    cats[1] === 'ciclismo' &&
    cats[2] === 'bicicletas'
  )
}

// Subcategoría opcional (si algún día agregás 4to nivel)
export const getBikeSubcategory = (q) => {
  const tokens = tokenize(q)

  const map = new Map([
    ['mtb', 'mountain'],
    ['mountain', 'mountain'],
    ['ruta', 'ruta'],
    ['road', 'ruta'],
    ['bmx', 'bmx'],
    ['fixie', 'fixie'],
    ['plegable', 'plegable'],
  ])

  for (const t of tokens) {
    if (map.has(t)) return map.get(t)
  }
  return null
}

export const isBikeSubcategory = (product, subcatNormalized) => {
  if (!subcatNormalized) return true

  const text = buildSearchText(product)
  return text.includes(subcatNormalized)
}

// --- CELULARES / PHONES ---
const phoneKeywords = new Set([
  'celular',
  'celulares',
  'telefono',
  'telefonos',
  'smartphone',
  'smartphones',
  'iphone',
  'android',
])

const phoneBrands = new Set([
  'iphone',
  'apple',
  'samsung',
  'xiaomi',
  'motorola',
  'huawei',
  'nokia',
  'oneplus',
  'realme',
  'oppo',
])

export const isPhoneIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => phoneKeywords.has(t) || phoneBrands.has(t))
}

export const extractPhoneBrand = (q) => {
  const tokens = tokenize(q)
  // iPhone puede venir como "iphone" o "apple"
  if (tokens.includes('iphone') || tokens.includes('apple')) return 'iphone'
  return tokens.find((t) => phoneBrands.has(t)) || null
}

export const isPhoneProduct = (product) => {
  const text = buildSearchText(product)

  // debe parecer teléfono
  const looksLikePhone =
    text.includes('celular') ||
    text.includes('telefono') ||
    text.includes('smartphone') ||
    text.includes('iphone') ||
    text.includes('android')

  if (!looksLikePhone) return false

  // opcional: excluir fundas / cargadores / templados (si te aparecen)
  const isAccessory =
    text.includes('funda') ||
    text.includes('cargador') ||
    text.includes('vidrio') ||
    text.includes('templado') ||
    text.includes('case')

  if (isAccessory) return false

  return true
}

// Extrae datos “iphone 15 pro max 256gb” de la query
export const parseIphoneQuery = (q) => {
  const tokens = tokenize(q)
  const joined = tokens.join(' ')

  // modelo: 13/14/15/16 etc (por si luego agregás más)
  const modelMatch = joined.match(/\b(1[0-9])\b/)
  const model = modelMatch ? modelMatch[1] : null

  // variantes
  const hasMini = tokens.includes('mini')
  const hasPro = tokens.includes('pro')
  const hasMax = tokens.includes('max')

  // storage (opcional)
  const storageMatch = joined.match(/\b(\d{2,4})gb\b/)
  const storage = storageMatch ? storageMatch[1] : null

  return {
    model, // "15"
    variant: hasMini ? 'mini' : hasPro ? (hasMax ? 'pro max' : 'pro') : null,
    storage, // "128" o "256"
  }
}

// true si el producto coincide con modelo/variante/storage pedidos
export const matchesIphoneSpecs = (product, specs) => {
  const text = buildSearchText(product)

  if (specs.model && !text.includes(`iphone ${specs.model}`)) return false

  if (specs.variant) {
    if (specs.variant === 'mini' && !text.includes('mini')) return false
    if (
      specs.variant === 'pro' &&
      (!text.includes('pro') || text.includes('max'))
    )
      return false
    if (
      specs.variant === 'pro max' &&
      !(text.includes('pro') && text.includes('max'))
    )
      return false
  }

  if (specs.storage && !text.includes(`${specs.storage}gb`)) return false

  return true
}
