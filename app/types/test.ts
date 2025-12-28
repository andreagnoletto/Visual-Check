// app/types/test.ts
import type { AcuityLine } from '~/utils/optotypeCalculations'

export type TestPhase = 'ready' | 'testing' | 'finished'

export interface TestResult {
  line: AcuityLine
  correct: number
  total: number
  passed: boolean
}
