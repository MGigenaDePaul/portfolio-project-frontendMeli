import { tokenize } from './normalize'
import { parseVehicleQuery } from './vehicle'

const motoBrands = new Set([
  'honda',
  'yamaha',
  'kawasaki',
  'suzuki',
  'ducati',
  'bmw',
  'ktm',
  'triumph',
  'harley',
  'harley-davidson',
  'bajaj',
  'rouser',
  'benelli',
  'zanella',
  'gilera',
  'motomel',
  'corven',
  'hero',
  'royal',
  'royal-enfield',
])

const extractMotoBrand = (tokens) => {
  if (tokens.includes('harley') && tokens.includes('davidson')) return 'harley'
  if (tokens.includes('royal') && tokens.includes('enfield')) return 'royal'
  return tokens.find((t) => motoBrands.has(t)) || null
}

export const isMotoQuery = (q) => {
  const tokens = tokenize(q)
  return tokens.includes('moto') || tokens.includes('motos')
}

export const parseMotoQuery = (q) => {
  const tokens = tokenize(q)
  const brand = extractMotoBrand(tokens)
  const vehicleFilters = parseVehicleQuery(q)

  return { brand, vehicleFilters }
}
