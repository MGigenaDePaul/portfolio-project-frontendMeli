import { tokenize } from './normalize'
import { parseVehicleQuery } from './vehicle'

const truckModels = new Set([
  'hilux',
  'ranger',
  'amarok',
  'frontier',
  's10',
  'toro',
  'dmax',
  'ram',
])

// Reutilizamos las marcas de car porque son las mismas
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

const extractTruckBrand = (tokens) => {
  if (tokens.includes('vw')) return 'volkswagen'
  return tokens.find((t) => carBrands.has(t)) || null
}

export const isTruckQuery = (q) => {
  const tokens = tokenize(q)

  const isTruckWord =
    tokens.includes('camioneta') ||
    tokens.includes('camionetas') ||
    tokens.includes('pickup') ||
    tokens.includes('pickups')

  const hasTruckModel = tokens.some((t) => truckModels.has(t))

  return isTruckWord || hasTruckModel
}

export const parseTruckQuery = (q) => {
  const tokens = tokenize(q)
  const brand = extractTruckBrand(tokens)
  const vehicleFilters = parseVehicleQuery(q)

  return { brand, vehicleFilters }
}
