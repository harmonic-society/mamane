import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const { triviaId } = await request.json();

    if (!triviaId) {
      return NextResponse.json({ error: "無効なリクエスト" }, { status: 400 });
    }

    // 管理者クライアント（RLSバイパス）を使用
    const adminSupabase = createAdminClient();

    // 投稿を削除（関連するhee_reactions、favorites、commentsはCASCADEで削除される）
    const { error: deleteError } = await adminSupabase
      .from("trivia")
      .delete()
      .eq("id", triviaId);

    if (deleteError) {
      console.error("削除エラー:", deleteError);
      return NextResponse.json(
        {
          error: "削除に失敗しました",
          details: deleteError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
