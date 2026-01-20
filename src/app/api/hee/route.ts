import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { triviaId } = await request.json();

  if (!triviaId) {
    return NextResponse.json({ error: "Trivia ID is required" }, { status: 400 });
  }

  // 豆知識の情報を取得
  const { data: trivia, error: triviaError } = await supabase
    .from("trivia")
    .select("id, title, user_id, hee_count")
    .eq("id", triviaId)
    .single() as { data: { id: string; title: string; user_id: string; hee_count: number } | null; error: any };

  if (triviaError || !trivia) {
    return NextResponse.json({ error: "Trivia not found" }, { status: 404 });
  }

  // 自分の投稿には反応できない
  if (trivia.user_id === user.id) {
    return NextResponse.json({ error: "Cannot react to own post" }, { status: 400 });
  }

  // 既にリアクション済みかチェック
  const { data: existing } = await supabase
    .from("hee_reactions")
    .select("id")
    .eq("trivia_id", triviaId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already reacted" }, { status: 400 });
  }

  // リアクションを追加
  const { error } = await supabase
    .from("hee_reactions")
    .insert({ trivia_id: triviaId, user_id: user.id } as any);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // hee_countを直接更新
  await supabase
    .from("trivia")
    .update({ hee_count: trivia.hee_count + 1 } as any)
    .eq("id", triviaId);

  // 反応したユーザーのプロフィールを取得
  const { data: actorProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single() as { data: { username: string } | null; error: any };

  // 通知を送信（非同期、エラーでも処理を継続）
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mamane.vercel.app";
    await fetch(`${siteUrl}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "hee",
        triviaId: trivia.id,
        triviaTitle: trivia.title,
        recipientUserId: trivia.user_id,
        actorUsername: actorProfile?.username || "ユーザー",
      }),
    });
  } catch (notifyError) {
    console.error("Failed to send notification:", notifyError);
  }

  return NextResponse.json({ success: true });
}
