import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase clients
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

const mockAdminFrom = vi.fn()
const mockAdminSelect = vi.fn()
const mockAdminOrder = vi.fn()
const mockAdminListUsers = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        listUsers: mockAdminListUsers,
      },
    },
    from: mockAdminFrom,
  }),
}))

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Server client setup
    mockFrom.mockReturnValue({
      select: mockSelect,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      single: mockSingle,
    })

    // Admin client setup
    mockAdminFrom.mockReturnValue({
      select: mockAdminSelect,
    })
    mockAdminSelect.mockReturnValue({
      order: mockAdminOrder,
    })
    mockAdminOrder.mockResolvedValue({ data: [], error: null })
    mockAdminListUsers.mockResolvedValue({
      data: { users: [] },
      error: null,
    })
  })

  function createRequest(): NextRequest {
    return new NextRequest('http://localhost/api/admin/users')
  }

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No user' } })

    createRequest()
    const response = await GET()

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('認証が必要です')
  })

  it('should return 403 when not admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: false },
      error: null,
    })

    const response = await GET()

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('管理者権限が必要です')
  })

  it('should return users list for admin', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })
    mockAdminListUsers.mockResolvedValueOnce({
      data: {
        users: [
          { id: 'user-1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', email_confirmed_at: '2024-01-01T00:00:00Z' },
          { id: 'user-2', email: 'user2@example.com', created_at: '2024-01-02T00:00:00Z', email_confirmed_at: null },
        ],
      },
      error: null,
    })

    const mockProfiles = [
      {
        id: 'user-1',
        username: 'user1',
        avatar_url: null,
        is_admin: false,
        is_banned: false,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'user-2',
        username: 'user2',
        avatar_url: 'https://example.com/avatar.jpg',
        is_admin: false,
        is_banned: false,
        created_at: '2024-01-02T00:00:00Z',
      },
    ]
    mockAdminOrder.mockResolvedValueOnce({ data: mockProfiles, error: null })

    // Trivia count data
    mockAdminSelect.mockReturnValueOnce({
      order: mockAdminOrder,
    })
    mockAdminOrder.mockResolvedValueOnce({
      data: [{ user_id: 'user-1' }, { user_id: 'user-1' }, { user_id: 'user-2' }],
      error: null,
    })

    const response = await GET()

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.users).toHaveLength(2)
    // user-2 is first because it has a later created_at (sorted descending)
    expect(data.users[0].email).toBe('user2@example.com')
    expect(data.users[0].username).toBe('user2')
    expect(data.users[1].email).toBe('user1@example.com')
    expect(data.users[1].username).toBe('user1')
  })

  it('should return 500 when auth list fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })
    mockAdminListUsers.mockResolvedValueOnce({
      data: null,
      error: { message: 'Auth error' },
    })

    const response = await GET()

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('ユーザー一覧の取得に失敗しました')
  })

  it('should include trivia_count field in response', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })
    mockAdminListUsers.mockResolvedValueOnce({
      data: { users: [{ id: 'user-1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', email_confirmed_at: '2024-01-01T00:00:00Z' }] },
      error: null,
    })

    const mockProfiles = [
      {
        id: 'user-1',
        username: 'user1',
        avatar_url: null,
        is_admin: false,
        is_banned: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    mockAdminOrder.mockResolvedValueOnce({ data: mockProfiles, error: null })

    const response = await GET()

    expect(response.status).toBe(200)
    const data = await response.json()
    // Should have trivia_count field (value depends on mock setup)
    expect(data.users[0]).toHaveProperty('trivia_count')
  })

  it('should return 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('Unexpected error'))

    const response = await GET()

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('サーバーエラー')
  })

  it('should handle empty email for users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })
    mockAdminListUsers.mockResolvedValueOnce({
      data: { users: [{ id: 'user-1', created_at: '2024-01-01T00:00:00Z', email_confirmed_at: null }] }, // No email
      error: null,
    })

    const mockProfiles = [
      {
        id: 'user-1',
        username: 'user1',
        avatar_url: null,
        is_admin: false,
        is_banned: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    ]
    mockAdminOrder.mockResolvedValueOnce({ data: mockProfiles, error: null })
    mockAdminFrom
      .mockReturnValueOnce({
        select: mockAdminSelect,
      })
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
      })

    const response = await GET()

    expect(response.status).toBe(200)
    const data = await response.json()
    // User exists but email is empty because auth user has no email
    expect(data.users[0].email).toBe('')
    expect(data.users[0].username).toBe('user1')
  })

  it('should include all required user fields', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })
    mockAdminListUsers.mockResolvedValueOnce({
      data: { users: [{ id: 'user-1', email: 'user1@example.com', created_at: '2024-01-01T00:00:00Z', email_confirmed_at: '2024-01-01T00:00:00Z' }] },
      error: null,
    })
    mockAdminOrder.mockResolvedValueOnce({
      data: [{
        id: 'user-1',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        is_admin: false,
        is_banned: false,
        created_at: '2024-01-01T00:00:00Z',
      }],
      error: null,
    })

    const response = await GET()

    expect(response.status).toBe(200)
    const data = await response.json()
    const user = data.users[0]
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('email_confirmed_at')
    expect(user).toHaveProperty('username')
    expect(user).toHaveProperty('avatar_url')
    expect(user).toHaveProperty('is_admin')
    expect(user).toHaveProperty('is_banned')
    expect(user).toHaveProperty('created_at')
    expect(user).toHaveProperty('trivia_count')
  })
})
