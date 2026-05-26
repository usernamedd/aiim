import { AppMode } from '../entities/AppMode'

export function getDefaultAppMode(): AppMode {
  return 'general'
}

export function validateAppMode(mode: string): mode is AppMode {
  return ['finance', 'software', 'general'].includes(mode)
}
