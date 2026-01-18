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
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "無効なリクエスト" }, { status: 400 });
    }

    // 管理者クライアント（RLSバイパス）を使用
    const adminSupabase = createAdminClient();

    // メール確認状態を更新
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("メール確認更新エラー:", updateError);
      return NextResponse.json(
        {
          error: "メール確認状態の更新に失敗しました",
          details: updateError.message
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
