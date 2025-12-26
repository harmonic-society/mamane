import { createClient } from "@/lib/supabase/server";
import { TriviaList } from "@/components/trivia/TriviaList";
import { notFound } from "next/navigation";
import type { TriviaWithDetails } from "@/types/database";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: PageProps) {
  const supabase = createClient();

  // カテゴリを取得
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single() as { data: any };

  if (!category) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // カテゴリに属する豆知識を取得
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
      categories!inner (
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
    .eq("category_id", category.id)
    .not("profiles.is_banned", "eq", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const triviaList: TriviaWithDetails[] = (triviaData || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    hee_count: item.hee_count,
    comment_count: item.comments?.length || 0,
    created_at: item.created_at,
    author_id: item.profiles.id,
    author_username: item.profiles.username,
    author_avatar: item.profiles.avatar_url,
    category_id: item.categories.id,
    category_name: item.categories.name,
    category_slug: item.categories.slug,
    category_icon: item.categories.icon,
    category_color: item.categories.color,
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
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>戻る</span>
      </Link>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.icon}
        </span>
        <span style={{ color: category.color }}>{category.name}</span>
        <span className="text-gray-400 text-lg font-normal">
          の豆知識
        </span>
      </h1>

      <TriviaList
        initialTriviaList={triviaList}
        userReactions={userReactions}
        userId={user?.id}
      />
    </div>
  );
}
