import { vi } from 'vitest'

// Mock user for authenticated state
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
}

export const mockAdminUser = {
  id: 'admin-123',
  email: 'admin@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
}

// Create mock Supabase client factory
export function createMockSupabaseClient(options: {
  user?: typeof mockUser | null
  isAdmin?: boolean
} = {}) {
  const { user = null, isAdmin = false } = options

  // Mock query builder that supports chaining
  const createQueryBuilder = (data: any[] | null = null, error: any = null) => {
    const builder: any = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: data?.[0] ?? null, error }),
      maybeSingle: vi.fn().mockResolvedValue({ data: data?.[0] ?? null, error }),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((resolve) =>
        resolve({ data, error, count: data?.length ?? 0 })
      ),
    }
    // Make it thenable to support await
    builder[Symbol.toStringTag] = 'Promise'
    return builder
  }

  const mockClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: user ? { user } : null },
        error: null,
      }),
      signIn: vi.fn(),
      signOut: vi.fn(),
      admin: {
        listUsers: vi.fn().mockResolvedValue({
          data: { users: [] },
          error: null,
        }),
      },
    },
    from: vi.fn((table: string) => {
      // Return appropriate mock data based on table
      return createQueryBuilder()
    }),
    rpc: vi.fn(),
  }

  return mockClient
}

// Mock for browser client
export const mockBrowserClient = createMockSupabaseClient

// Mock for server client
export const mockServerClient = createMockSupabaseClient

// Mock for admin client
export const mockAdminClient = () => createMockSupabaseClient({ isAdmin: true })

// Helper to setup Supabase mocks in tests
export function setupSupabaseMocks(options: {
  user?: typeof mockUser | null
  isAdmin?: boolean
} = {}) {
  const client = createMockSupabaseClient(options)

  vi.mock('@/lib/supabase/client', () => ({
    createClient: () => client,
  }))

  vi.mock('@/lib/supabase/server', () => ({
    createClient: () => client,
  }))

  vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: () => client,
  }))

  return client
}
