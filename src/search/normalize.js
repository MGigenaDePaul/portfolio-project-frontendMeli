// normalize → limpia texto
export const normalize = (str = '') =>
  String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

// tokenize → convierte un texto en palabras limpias
export const tokenize = (q = '') => normalize(q).split(/\s+/).filter(Boolean)

// stem → reduce palabras a su raíz (stemming simple para español)
export const stem = (word) => {
  word = normalize(word)

  // Plurales: -s, -es
  if (word.endsWith('es') && word.length > 3) {
    return word.slice(0, -2)
  }
  if (word.endsWith('s') && word.length > 2) {
    return word.slice(0, -1)
  }

  return word
}

// stemTokens → tokeniza y aplica stem a cada palabra
export const stemTokens = (q = '') => tokenize(q).map(stem)
