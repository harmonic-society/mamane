import type { TriviaWithDetails, CommentWithAuthor } from '@/types/database'

export const mockTrivia: TriviaWithDetails = {
  id: 'trivia-1',
  title: 'テストトリビア',
  content: 'これはテスト用のトリビアです。',
  hee_count: 10,
  comment_count: 3,
  created_at: '2024-01-15T10:00:00.000Z',
  author_id: 'author-1',
  author_username: 'testuser',
  author_avatar: null,
  category_id: 'cat-1',
  category_name: '科学',
  category_slug: 'science',
  category_icon: '🔬',
  category_color: '#4CAF50',
}

export const mockTriviaList: TriviaWithDetails[] = [
  mockTrivia,
  {
    id: 'trivia-2',
    title: '2番目のトリビア',
    content: '二番目のテストトリビアです。',
    hee_count: 5,
    comment_count: 1,
    created_at: '2024-01-14T10:00:00.000Z',
    author_id: 'author-2',
    author_username: 'anotheruser',
    author_avatar: 'https://example.com/avatar.jpg',
    category_id: 'cat-2',
    category_name: '歴史',
    category_slug: 'history',
    category_icon: '📜',
    category_color: '#FF9800',
  },
  {
    id: 'trivia-3',
    title: '3番目のトリビア',
    content: '三番目のテストトリビアです。カテゴリなし。',
    hee_count: 0,
    comment_count: 0,
    created_at: '2024-01-13T10:00:00.000Z',
    author_id: 'author-1',
    author_username: 'testuser',
    author_avatar: null,
    category_id: null,
    category_name: null,
    category_slug: null,
    category_icon: null,
    category_color: null,
  },
]

export const mockComment: CommentWithAuthor = {
  id: 'comment-1',
  content: 'これはテストコメントです。',
  created_at: '2024-01-15T12:00:00.000Z',
  author_id: 'commenter-1',
  author_username: 'commenter',
  author_avatar: null,
}

export const mockComments: CommentWithAuthor[] = [
  mockComment,
  {
    id: 'comment-2',
    content: '2番目のコメント。\n改行も含みます。',
    created_at: '2024-01-15T11:00:00.000Z',
    author_id: 'commenter-2',
    author_username: 'another_commenter',
    author_avatar: 'https://example.com/avatar2.jpg',
  },
]

// Generate larger trivia list for pagination tests
export function generateTriviaList(count: number, startIndex = 0): TriviaWithDetails[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `trivia-${startIndex + i}`,
    title: `トリビア ${startIndex + i + 1}`,
    content: `これは ${startIndex + i + 1} 番目のトリビアです。`,
    hee_count: Math.floor(Math.random() * 100),
    comment_count: Math.floor(Math.random() * 10),
    created_at: new Date(Date.now() - (startIndex + i) * 86400000).toISOString(),
    author_id: `author-${(startIndex + i) % 3}`,
    author_username: `user${(startIndex + i) % 3}`,
    author_avatar: (startIndex + i) % 2 === 0 ? null : `https://example.com/avatar${(startIndex + i) % 3}.jpg`,
    category_id: (startIndex + i) % 4 === 0 ? null : `cat-${(startIndex + i) % 3}`,
    category_name: (startIndex + i) % 4 === 0 ? null : ['科学', '歴史', '文化'][(startIndex + i) % 3],
    category_slug: (startIndex + i) % 4 === 0 ? null : ['science', 'history', 'culture'][(startIndex + i) % 3],
    category_icon: (startIndex + i) % 4 === 0 ? null : ['🔬', '📜', '🎭'][(startIndex + i) % 3],
    category_color: (startIndex + i) % 4 === 0 ? null : ['#4CAF50', '#FF9800', '#9C27B0'][(startIndex + i) % 3],
  }))
}
