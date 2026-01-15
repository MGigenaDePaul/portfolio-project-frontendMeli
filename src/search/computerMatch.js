// src/search/computerMatch.js
import { buildSearchText } from './text'

// Match “MVP” por texto (sirve si tus títulos/descripciones incluyen specs tipo "16gb", "512gb", "i5", etc.)
export const matchesComputerSpecs = (product, specs) => {
  if (!specs) return true

  const text = buildSearchText(product)

  // brand
  if (specs.brand && !text.includes(specs.brand)) return false

  // ram: 16gb
  if (specs.ramGB && !text.includes(`${specs.ramGB}gb`)) return false

  // storage: 512gb / 1tb
  if (specs.storage?.value && specs.storage?.unit) {
    const needle = `${specs.storage.value}${specs.storage.unit}`
    if (!text.includes(needle)) return false
  }

  // cpu: i5 / ryzen5
  if (specs.cpu?.brand && specs.cpu?.tier) {
    if (!text.includes(specs.cpu.tier)) return false
  }

  return true
}
