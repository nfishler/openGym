import { describe, it, expect } from 'vitest'
import { LANGS, RTL_LANGS, DATE_LOCALES } from './i18n-core.js'
import { matchLocale } from './default-lang.js'
import he from '../locales/he.js'

describe('Hebrew locale', () => {
  it('is offered, right-to-left, with an Israeli date locale', () => {
    expect(LANGS.he).toBe('עברית')
    expect(RTL_LANGS.has('he')).toBe(true)
    expect(DATE_LOCALES.he).toBe('he-IL')
  })
  it('matches browser tags, including the legacy iw code', () => {
    expect(matchLocale('he-IL')).toBe('he')
    expect(matchLocale('iw-IL')).toBe('he')
    expect(matchLocale('iw')).toBe('he')
  })
  it('ships a pack', () => {
    expect(he.Rest).toBe('מנוחה')
  })
})
