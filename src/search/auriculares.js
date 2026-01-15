// src/search/auriculares.js
import { matchesPathPrefix } from './categoryMatch'
import { buildSearchText } from './text'

export const isHeadphoneProduct = (product) => {
  // fuerte por categoría
  if (matchesPathPrefix(product, ['tecnologia', 'auriculares'])) return true

  // fallback por texto
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
