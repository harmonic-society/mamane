import { createClient } from "@/lib/supabase/server";
import { TriviaList } from "@/components/trivia/TriviaList";
import { CategoryBadge } from "@/components/category/CategoryBadge";
import Link from "next/link";
import type { TriviaWithDetails, Category } from "@/types/database";

export default async function HomePage() {
  const supabase = createClient();

  // ユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // カテゴリ一覧を取得
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  // 豆知識一覧を取得（結合クエリ）
  const { data: triviaData } = await supabase
    .from("trivia")
    .select(
      `
      id,
      title,
      content,
      hee_count,
      created_at,
      user_id,
      category_id,
      profiles!inner (
        id,
        username,
        avatar_url
      ),
      categories (
        id,
        name,
        slug,
        icon,
        color
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  // データを整形
  const triviaList: TriviaWithDetails[] = (triviaData || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    hee_count: item.hee_count,
    created_at: item.created_at,
    author_id: item.profiles.id,
    author_username: item.profiles.username,
    author_avatar: item.profiles.avatar_url,
    category_id: item.categories?.id || null,
    category_name: item.categories?.name || null,
    category_slug: item.categories?.slug || null,
    category_icon: item.categories?.icon || null,
    category_color: item.categories?.color || null,
  }));

  // ユーザーのリアクションを取得
  let userReactions: string[] = [];
  if (user) {
    const { data: reactions } = await supabase
      .from("hee_reactions")
      .select("trivia_id")
      .eq("user_id", user.id) as { data: any[] | null };
    userReactions = (reactions || []).map((r) => r.trivia_id);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ヒーローセクション */}
      <section className="text-center mb-12">
        {/* ピンクのぞうさんマスコット */}
        <div className="mb-6">
          <div className="inline-block elephant-bounce">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg mx-auto">
              <span className="text-5xl">🐘</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
            へぇ〜
          </span>
          と言いたくなる
          <br />
          豆知識を共有しよう
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          ぞうさんと一緒に面白い雑学を投稿して、みんなから「へぇ」をもらおう！
        </p>
        <Link
          href="/trivia/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-shadow"
        >
          <span className="text-xl">🐘</span>
          豆知識を投稿する
        </Link>
      </section>

      {/* カテゴリ一覧 */}
      {categories && categories.length > 0 && (
        <section className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {(categories as Category[]).map((category) => (
              <CategoryBadge
                key={category.id}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
                color={category.color}
              />
            ))}
          </div>
        </section>
      )}

      {/* 豆知識一覧 */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>🆕</span>
          新着の豆知識
        </h2>
        <TriviaList
          triviaList={triviaList}
          userReactions={userReactions}
          userId={user?.id}
        />
      </section>
    </div>
  );
}
