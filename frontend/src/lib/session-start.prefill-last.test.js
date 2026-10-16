import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildSessionEntries, setPrefillFromLast } from './session-start.js'
import { isWarmupRow } from './workout-model.js'

// fishlerhome: planned sessions prefill exactly from the last session; progression only advises.
const BENCH = '0025'
const work = e => e.sets.filter(s => !isWarmupRow(s)).map(s => [s.w, s.r])
const st = (sets, extra = {}) => ({
  unit: 'kg', exWeights: {}, routines: [],
  workouts: [{ d: '2026-10-10', routineIds: ['r'], entries: [{ id: BENCH, target: { sets: 3, reps: 15, repsMin: 13, weight: 16 }, sets: sets.map(([w, r]) => ({ w, r, done: true })) }] }],
  ...extra,
})

describe('prefill from last session', () => {
  beforeAll(() => setPrefillFromLast(true))
  afterAll(() => setPrefillFromLast(false))

  it('double progression at the top of the range still opens at 3 × 16 kg × 15, with the advice kept', () => {
    const r = { id: 'r', prog: 'double', ex: [{ id: BENCH, sets: 3, reps: 15, repsMin: 13, weight: 16, prog: 'double' }] }
    const [e] = buildSessionEntries(st([[16, 15], [16, 15], [16, 15]]), r)
    expect(work(e)).toEqual([[16, 15], [16, 15], [16, 15]])
    expect(e.target).toMatchObject({ sets: 3, reps: 15, weight: 16 })
    expect(e.plan.kind).not.toBe('off')     // the recommendation is still computed for display
    expect(e.plan.weight).toBeGreaterThan(16)
  })

  it('copies the set count and each set as logged, even off the plan', () => {
    const r = { id: 'r', prog: 'linear', ex: [{ id: BENCH, sets: 3, reps: 10, weight: 40 }] }
    const [e] = buildSessionEntries(st([[40, 12], [42.5, 9], [40, 8], [35, 10]]), r)
    expect(work(e)).toEqual([[40, 12], [42.5, 9], [40, 8], [35, 10]])
    expect(e.target.sets).toBe(4)
  })

  it('keeps the upstream behaviour with no last session', () => {
    const r = { id: 'r', prog: 'linear', ex: [{ id: BENCH, sets: 2, reps: 8, weight: 50 }] }
    const [e] = buildSessionEntries({ unit: 'kg', exWeights: {}, routines: [], workouts: [] }, r)
    expect(work(e)).toEqual([[50, 8], [50, 8]])
    expect(e.fromLast).toBeUndefined()
  })

  it('a deload routine (excluded from progression) keeps its own numbers', () => {
    const r = { id: 'r', prog: 'linear', excludeFromProgression: true, ex: [{ id: BENCH, sets: 2, reps: 8, weight: 10 }] }
    const [e] = buildSessionEntries(st([[16, 15], [16, 15]]), r)
    expect(work(e)).toEqual([[10, 8], [10, 8]])
  })
})
