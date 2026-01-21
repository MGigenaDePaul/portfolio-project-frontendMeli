import { tokenize } from './normalize'

const securityKeywords = new Set([
  'seguridad',
  'security',
  'cctv',
  'vigilancia',
])

const cameraKeywords = new Set(['camara', 'camaras', 'camera', 'cameras'])

export const isCameraQuery = (q) => {
  const tokens = tokenize(q)

  const isCameraWord = tokens.some((t) => cameraKeywords.has(t))
  const wantsSecurity = tokens.some((t) => securityKeywords.has(t))

  return isCameraWord || wantsSecurity
}

export const parseCameraQuery = (q) => {
  const tokens = tokenize(q)
  const wantsSecurity = tokens.some((t) => securityKeywords.has(t))

  return {
    isSecurity: wantsSecurity,
    categoryHint: wantsSecurity
      ? ['tecnologia', 'camaras de seguridad']
      : ['tecnologia', 'camaras'],
  }
}
