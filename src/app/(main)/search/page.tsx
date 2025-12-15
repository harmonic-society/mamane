import { createClient } from "@/lib/supabase/server";
import { TriviaList } from "@/components/trivia/TriviaList";
import { SearchBar } from "@/components/search/SearchBar";
import type { TriviaWithDetails } from "@/types/database";
import { Search } from "lucide-react";

interface PageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const supabase = createClient();
  const query = searchParams.q || "";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let triviaList: TriviaWithDetails[] = [];

  if (query) {
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
        ),
        comments (
          id
        )
      `
      )
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("hee_count", { ascending: false })
      .limit(20);

    triviaList = (triviaData || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      hee_count: item.hee_count,
      comment_count: item.comments?.length || 0,
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
  }

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
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Search className="text-yellow-500" size={32} />
        検索
      </h1>

      <div className="mb-8">
        <SearchBar initialQuery={query} />
      </div>

      {query ? (
        <>
          <p className="text-gray-600 mb-6">
            「<span className="font-bold text-gray-800">{query}</span>」の検索結果
            <span className="ml-2 text-gray-400">
              ({triviaList.length}件)
            </span>
          </p>
          <TriviaList
            triviaList={triviaList}
            userReactions={userReactions}
            userId={user?.id}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-6xl mb-4">🔍</p>
          <p className="text-gray-500">キーワードを入力して検索してください</p>
        </div>
      )}
    </div>
  );
}
