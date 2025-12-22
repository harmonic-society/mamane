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

  // 既存のお気に入りをチェック
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("trivia_id", triviaId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // 既にお気に入り済みなら削除
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("trivia_id", triviaId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorited: false });
  } else {
    // 豆知識の情報を取得
    const { data: trivia, error: triviaError } = await supabase
      .from("trivia")
      .select("id, title, user_id")
      .eq("id", triviaId)
      .single() as { data: { id: string; title: string; user_id: string } | null; error: any };

    if (triviaError || !trivia) {
      return NextResponse.json({ error: "Trivia not found" }, { status: 404 });
    }

    // お気に入りに追加
    const { error } = await supabase
      .from("favorites")
      .insert({ trivia_id: triviaId, user_id: user.id } as any);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 自分の投稿でなければ通知を送信
    if (trivia.user_id !== user.id) {
      // お気に入りしたユーザーのプロフィールを取得
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
            type: "favorite",
            triviaId: trivia.id,
            triviaTitle: trivia.title,
            recipientUserId: trivia.user_id,
            actorUsername: actorProfile?.username || "ユーザー",
          }),
        });
      } catch (notifyError) {
        console.error("Failed to send notification:", notifyError);
      }
    }

    return NextResponse.json({ favorited: true });
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  const triviaId = searchParams.get("triviaId");
  const userId = searchParams.get("userId");

  if (triviaId) {
    // 特定の豆知識に対するお気に入り状態を取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ favorited: false });
    }

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("trivia_id", triviaId)
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({ favorited: !!data });
  }

  if (userId) {
    // ユーザーのお気に入り一覧を取得
    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        created_at,
        trivia:trivia_id (
          id,
          title,
          hee_count,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
