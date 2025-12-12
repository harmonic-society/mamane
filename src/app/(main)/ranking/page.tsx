import { createClient } from "@/lib/supabase/server";
import { TriviaList } from "@/components/trivia/TriviaList";
import type { TriviaWithDetails } from "@/types/database";
import { Trophy } from "lucide-react";

export default async function RankingPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // へぇ数順でソート
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
    .order("hee_count", { ascending: false })
    .limit(20);

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
        <Trophy className="text-yellow-500" size={32} />
        ラッシャーランキング
      </h1>

      <TriviaList
        triviaList={triviaList}
        userReactions={userReactions}
        userId={user?.id}
        showRank={true}
      />
    </div>
  );
}
