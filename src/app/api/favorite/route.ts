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
    // お気に入りに追加
    const { error } = await supabase
      .from("favorites")
      .insert({ trivia_id: triviaId, user_id: user.id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
