import { tokenize } from './normalize'
import { parseVehicleQuery } from './vehicle'

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

const extractCarBrand = (tokens) => {
  if (tokens.includes('vw')) return 'volkswagen'
  return tokens.find((t) => carBrands.has(t)) || null
}

export const isCarQuery = (q) => {
  const tokens = tokenize(q)
  const isAutoWord = tokens.includes('auto') || tokens.includes('autos')
  const carBrand = extractCarBrand(tokens)

  return isAutoWord || carBrand !== null
}

export const parseCarQuery = (q) => {
  const tokens = tokenize(q)
  const brand = extractCarBrand(tokens)
  const vehicleFilters = parseVehicleQuery(q)

  return { brand, vehicleFilters }
}
