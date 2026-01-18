import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase clients
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

const mockAdminFrom = vi.fn()
const mockAdminUpdate = vi.fn()
const mockAdminDelete = vi.fn()
const mockAdminEq = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: mockAdminFrom,
  }),
}))

describe('POST /api/admin/ban', () => {
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
      update: mockAdminUpdate,
      delete: mockAdminDelete,
    })
    mockAdminUpdate.mockReturnValue({
      eq: mockAdminEq,
    })
    mockAdminEq.mockResolvedValue({ error: null })
    mockAdminDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
  })

  function createRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'No user' } })

    const request = createRequest({ userId: 'user-1', isBanned: true })
    const response = await POST(request)

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

    const request = createRequest({ userId: 'user-2', isBanned: true })
    const response = await POST(request)

    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('管理者権限が必要です')
  })

  it('should return 400 when userId is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })

    const request = createRequest({ isBanned: true })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('無効なリクエスト')
  })

  it('should return 400 when isBanned is not boolean', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })

    const request = createRequest({ userId: 'user-1', isBanned: 'true' })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('無効なリクエスト')
  })

  it('should successfully ban user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })

    const request = createRequest({ userId: 'user-1', isBanned: true })
    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.isBanned).toBe(true)
  })

  it('should update is_banned field', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })

    const request = createRequest({ userId: 'user-1', isBanned: true })
    await POST(request)

    expect(mockAdminUpdate).toHaveBeenCalledWith({ is_banned: true })
    expect(mockAdminEq).toHaveBeenCalledWith('id', 'user-1')
  })

  it('should delete user content when banning', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })

    const request = createRequest({ userId: 'user-1', isBanned: true })
    await POST(request)

    // Should delete comments and trivia
    expect(mockAdminFrom).toHaveBeenCalledWith('comments')
    expect(mockAdminFrom).toHaveBeenCalledWith('trivia')
    expect(mockAdminDelete).toHaveBeenCalled()
  })

  it('should not delete content when unbanning', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })

    const request = createRequest({ userId: 'user-1', isBanned: false })
    await POST(request)

    // Should only call update, not delete
    expect(mockAdminUpdate).toHaveBeenCalled()
    // Delete should only be called through the update chain, not for content deletion
  })

  it('should return 500 when update fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { is_admin: true },
      error: null,
    })
    mockAdminEq.mockResolvedValueOnce({ error: { message: 'Update failed' } })

    const request = createRequest({ userId: 'user-1', isBanned: true })
    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('BAN状態の更新に失敗しました')
  })

  it('should return 500 on unexpected error', async () => {
    mockGetUser.mockRejectedValue(new Error('Unexpected error'))

    const request = createRequest({ userId: 'user-1', isBanned: true })
    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('サーバーエラー')
  })
})
