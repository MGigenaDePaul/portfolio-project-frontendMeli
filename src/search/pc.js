// src/search/pc.js
import { matchesPathPrefix } from './categoryMatch'
import { buildSearchText } from './text'

export const isPcProduct = (product) => {
  // fuerte por categoría
  if (matchesPathPrefix(product, ['tecnologia', 'pcs'])) return true

  // fallback por texto (por si quedó mal categorizado)
  const text = buildSearchText(product)
  return (
    text.includes('pc') ||
    text.includes('desktop') ||
    text.includes('cpu') ||
    text.includes('gabinete') ||
    text.includes('torre') ||
    text.includes('escritorio')
  )
}
