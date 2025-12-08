-- 既存のカテゴリを削除（もしあれば）
DELETE FROM public.categories;

-- 新しいカテゴリを挿入
INSERT INTO public.categories (name, slug, icon, color, sort_order) VALUES
  ('雑学', 'trivia', '💡', '#FFD700', 1),
  ('日常', 'daily', '☀️', '#4CAF50', 2),
  ('アニメ', 'anime', '🎬', '#E91E63', 3),
  ('漫画', 'manga', '📚', '#9C27B0', 4);
