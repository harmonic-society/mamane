export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  avatar_url: null,
  total_hee_received: 100,
  created_at: '2024-01-01T00:00:00.000Z',
  is_admin: false,
  is_banned: false,
}

export const mockAdminUser = {
  id: 'admin-123',
  email: 'admin@example.com',
  username: 'adminuser',
  avatar_url: 'https://example.com/admin-avatar.jpg',
  total_hee_received: 500,
  created_at: '2023-06-01T00:00:00.000Z',
  is_admin: true,
  is_banned: false,
}

export const mockBannedUser = {
  id: 'banned-123',
  email: 'banned@example.com',
  username: 'banneduser',
  avatar_url: null,
  total_hee_received: 10,
  created_at: '2024-01-10T00:00:00.000Z',
  is_admin: false,
  is_banned: true,
}

export const mockProfile = {
  id: 'user-123',
  username: 'testuser',
  avatar_url: null,
  total_hee_received: 100,
  created_at: '2024-01-01T00:00:00.000Z',
}

export const mockAdminProfile = {
  id: 'admin-123',
  username: 'adminuser',
  avatar_url: 'https://example.com/admin-avatar.jpg',
  total_hee_received: 500,
  created_at: '2023-06-01T00:00:00.000Z',
  is_admin: true,
  is_banned: false,
}

export const mockUsersList = [
  {
    id: 'user-1',
    email: 'user1@example.com',
    username: 'user1',
    avatar_url: null,
    is_admin: false,
    is_banned: false,
    created_at: '2024-01-01T00:00:00.000Z',
    trivia_count: 5,
  },
  {
    id: 'user-2',
    email: 'user2@example.com',
    username: 'user2',
    avatar_url: 'https://example.com/avatar2.jpg',
    is_admin: false,
    is_banned: false,
    created_at: '2024-01-05T00:00:00.000Z',
    trivia_count: 10,
  },
  {
    id: 'admin-123',
    email: 'admin@example.com',
    username: 'adminuser',
    avatar_url: 'https://example.com/admin-avatar.jpg',
    is_admin: true,
    is_banned: false,
    created_at: '2023-06-01T00:00:00.000Z',
    trivia_count: 25,
  },
]
