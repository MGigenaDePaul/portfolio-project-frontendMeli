import { tokenize } from './normalize'
import { matchesPathPrefix } from './categoryMatch'
import { buildSearchText } from './text'

const notebookKeywords = new Set([
  'notebook',
  'notebooks',
  'laptop',
  'laptops',
  'macbook',
  'ultrabook',
])

export const isNotebookIntent = (q) => {
  const tokens = tokenize(q)
  return tokens.some((t) => notebookKeywords.has(t))
}

export const isNotebookProduct = (product) => {
  if (matchesPathPrefix(product, ['tecnologia', 'notebooks'])) return true

  // fallback por texto (por si algún producto quedó mal categorizado)
  const text = buildSearchText(product)
  return (
    text.includes('laptop') ||
    text.includes('notebook') ||
    text.includes('macbook') ||
    text.includes('ultrabook')
  )
}
