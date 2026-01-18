import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('should merge Tailwind classes and resolve conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays of class names', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle complex Tailwind conflicts', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2')
    expect(cn('rounded-lg', 'rounded-full')).toBe('rounded-full')
  })

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle mixed inputs', () => {
    const isActive = true
    const isDisabled = false
    expect(cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class',
      { 'hover-class': true },
      ['array-class']
    )).toBe('base-class active-class hover-class array-class')
  })
})
