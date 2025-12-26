import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // 現在のユーザーを取得
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 管理者権限を確認
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!(currentProfile as { is_admin: boolean } | null)?.is_admin) {
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    // リクエストボディを取得
    const { userId, isBanned } = await request.json();

    if (!userId || typeof isBanned !== "boolean") {
      return NextResponse.json({ error: "無効なリクエスト" }, { status: 400 });
    }

    // 対象ユーザーのBAN状態を更新
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_banned: isBanned } as any)
      .eq("id", userId);

    if (updateError) {
      console.error("BAN更新エラー:", updateError);
      return NextResponse.json(
        {
          error: "BAN状態の更新に失敗しました。SupabaseのRLSポリシーを確認してください。",
          details: updateError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, isBanned });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
