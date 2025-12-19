import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CategoryBadge } from "@/components/category/CategoryBadge";
import { HeeButton } from "@/components/trivia/HeeButton";
import { CommentForm } from "@/components/comment/CommentForm";
import { CommentList } from "@/components/comment/CommentList";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { DeleteButton } from "@/components/trivia/DeleteButton";
import type { CommentWithAuthor } from "@/types/database";

interface PageProps {
  params: { id: string };
}

export default async function TriviaDetailPage({ params }: PageProps) {
  const supabase = createClient();

  // ユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 豆知識を取得
  const { data: trivia } = await supabase
    .from("trivia")
    .select(
      `
      id,
      title,
      content,
      hee_count,
      created_at,
      user_id,
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
    .eq("id", params.id)
    .single() as { data: any };

  if (!trivia) {
    notFound();
  }

  // ユーザーがリアクション済みか確認
  let hasReacted = false;
  if (user) {
    const { data: reaction } = await supabase
      .from("hee_reactions")
      .select("id")
      .eq("trivia_id", params.id)
      .eq("user_id", user.id)
      .single();
    hasReacted = !!reaction;
  }

  // コメントを取得
  const { data: commentsData } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles!inner (
        id,
        username,
        avatar_url
      )
    `)
    .eq("trivia_id", params.id)
    .order("created_at", { ascending: true });

  const comments: CommentWithAuthor[] = (commentsData || []).map((item: any) => ({
    id: item.id,
    content: item.content,
    created_at: item.created_at,
    author_id: item.profiles.id,
    author_username: item.profiles.username,
    author_avatar: item.profiles.avatar_url,
  }));

  const profile = trivia.profiles as any;
  const category = trivia.categories as any;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>戻る</span>
      </Link>

      <article className="bg-white rounded-2xl shadow-lg p-8">
        {/* カテゴリ */}
        {category && (
          <div className="mb-4">
            <CategoryBadge
              name={category.name}
              slug={category.slug}
              icon={category.icon}
              color={category.color}
            />
          </div>
        )}

        {/* タイトル */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{trivia.title}</h1>

        {/* 本文 */}
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {trivia.content}
          </p>
        </div>

        {/* へぇボタン（中央配置） */}
        <div className="flex justify-center mb-8 py-6 border-y border-gray-100">
          <HeeButton
            triviaId={trivia.id}
            initialCount={trivia.hee_count}
            hasReacted={hasReacted}
            userId={user?.id}
            authorId={profile.id}
          />
        </div>

        {/* 投稿者情報 */}
        <div>
          <Link
            href={`/user/${profile.id}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center text-lg font-medium text-yellow-700">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800 group-hover:text-yellow-600 transition-colors">
                {profile.username}
              </p>
              <p className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(trivia.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
          </Link>

          {/* 削除ボタン（投稿者のみ表示） */}
          {user && (
            <div className="mt-4">
              <DeleteButton
                triviaId={trivia.id}
                userId={user.id}
                authorId={profile.id}
              />
            </div>
          )}
        </div>
      </article>

      {/* コメントセクション */}
      <section className="mt-8 bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-pink-500" />
          コメント
          <span className="text-sm font-normal text-gray-400">
            ({comments.length})
          </span>
        </h2>

        <div className="mb-6">
          <CommentForm triviaId={trivia.id} userId={user?.id} />
        </div>

        <CommentList comments={comments} />
      </section>
    </div>
  );
}
