import React from 'react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Helper to create motion component mock
const createMotionComponent = (Element: string) => {
  return React.forwardRef(({ children, ...props }: any, ref: any) => {
    const {
      initial, animate, exit, whileHover, whileTap, whileFocus, whileDrag,
      variants, transition, layout, layoutId, drag, dragConstraints,
      onAnimationStart, onAnimationComplete, onDragStart, onDragEnd, onDrag,
      ...rest
    } = props
    return React.createElement(Element, { ref, ...rest }, children)
  })
}

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    motion: {
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
      button: createMotionComponent('button'),
      p: createMotionComponent('p'),
      article: createMotionComponent('article'),
      section: createMotionComponent('section'),
      header: createMotionComponent('header'),
      footer: createMotionComponent('footer'),
      nav: createMotionComponent('nav'),
      ul: createMotionComponent('ul'),
      li: createMotionComponent('li'),
      a: createMotionComponent('a'),
      form: createMotionComponent('form'),
      input: createMotionComponent('input'),
      img: createMotionComponent('img'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

// Mock IntersectionObserver for infinite scroll tests
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock fetch globally
global.fetch = vi.fn()

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
