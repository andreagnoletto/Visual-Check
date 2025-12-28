// app/utils/normalizeInput.ts
export type NormalizedAction = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | null

const KEY_MAP: Record<string, NormalizedAction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'confirm',
  NumpadEnter: 'confirm',
  ' ': 'confirm',
  Escape: 'back',
  Backspace: 'back',
}

// Fallback keyCode para Android TV, Tizen, webOS
const KEYCODE_MAP: Record<number, NormalizedAction> = {
  13: 'confirm', // Enter
  66: 'confirm', // Android Enter
  23: 'confirm', // Android D-pad center
  4: 'back', // Android Back
  10009: 'back', // Tizen Back
  461: 'back', // webOS Back
  38: 'up', // Up arrow (keyCode)
  40: 'down', // Down arrow (keyCode)
  37: 'left', // Left arrow (keyCode)
  39: 'right', // Right arrow (keyCode)
}

export function normalizeInput(event: KeyboardEvent): NormalizedAction {
  // Primeiro tenta pelo key (moderno)
  if (event.key && KEY_MAP[event.key] !== undefined) {
    return KEY_MAP[event.key]
  }

  // Fallback para keyCode (TV/legacy)
  if (event.keyCode && KEYCODE_MAP[event.keyCode] !== undefined) {
    return KEYCODE_MAP[event.keyCode]
  }

  return null
}

export function isNavigationKey(event: KeyboardEvent): boolean {
  const action = normalizeInput(event)
  return action === 'up' || action === 'down' || action === 'left' || action === 'right'
}

export function isConfirmKey(event: KeyboardEvent): boolean {
  return normalizeInput(event) === 'confirm'
}

export function isBackKey(event: KeyboardEvent): boolean {
  return normalizeInput(event) === 'back'
}
