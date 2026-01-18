import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

// Mock fetch for notifications
global.fetch = vi.fn()

describe('POST /api/hee', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default chain setup
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    })
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    mockEq.mockReturnValue({
      eq: mockEq,
      single: mockSingle,
    })
    mockInsert.mockResolvedValue({ error: null })
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
  })

  function createRequest(body: object): NextRequest {
    return new NextRequest('http://localhost/api/hee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 when triviaId is missing', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const request = createRequest({})
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Trivia ID is required')
  })

  it('should return 404 when trivia not found', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

    const request = createRequest({ triviaId: 'nonexistent' })
    const response = await POST(request)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Trivia not found')
  })

  it('should return 400 when reacting to own post', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle.mockResolvedValueOnce({
      data: { id: 'trivia-1', title: 'Test', user_id: 'user-1' },
      error: null,
    })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Cannot react to own post')
  })

  it('should return 400 when already reacted', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'reaction-1' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Already reacted')
  })

  it('should successfully create hee reaction', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test Trivia', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { username: 'testuser' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('should call insert with correct data', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { username: 'testuser' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    await POST(request)

    expect(mockInsert).toHaveBeenCalledWith({
      trivia_id: 'trivia-1',
      user_id: 'user-1',
    })
  })

  it('should return 500 when insert fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })
    mockInsert.mockResolvedValue({ error: { message: 'Database error' } })

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Database error')
  })

  it('should send notification after successful reaction', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test Trivia', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { username: 'reactor' },
        error: null,
      })

    const request = createRequest({ triviaId: 'trivia-1' })
    await POST(request)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notify'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hee',
          triviaId: 'trivia-1',
          triviaTitle: 'Test Trivia',
          recipientUserId: 'author-1',
          actorUsername: 'reactor',
        }),
      })
    )
  })

  it('should not fail when notification fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })
    mockSingle
      .mockResolvedValueOnce({
        data: { id: 'trivia-1', title: 'Test', user_id: 'author-1' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { username: 'reactor' },
        error: null,
      })
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

    const request = createRequest({ triviaId: 'trivia-1' })
    const response = await POST(request)

    // Should still return success
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
