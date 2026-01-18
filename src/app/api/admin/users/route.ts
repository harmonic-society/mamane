import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
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

    // 管理者クライアント（RLSバイパス）を使用
    const adminSupabase = createAdminClient();

    // Auth APIからユーザー一覧を取得
    const { data: authData, error: authListError } = await adminSupabase.auth.admin.listUsers();

    if (authListError) {
      console.error("Auth users取得エラー:", authListError);
      return NextResponse.json(
        { error: "ユーザー一覧の取得に失敗しました" },
        { status: 500 }
      );
    }

    // profilesテーブルからデータを取得
    const { data: profiles } = await adminSupabase
      .from("profiles")
      .select("id, username, avatar_url, is_admin, is_banned, created_at")
      .order("created_at", { ascending: false });

    // trivia countを取得
    const { data: triviaCounts } = await adminSupabase
      .from("trivia")
      .select("user_id");

    // user_idごとのカウントを集計
    const countMap: Record<string, number> = {};
    if (triviaCounts) {
      for (const t of triviaCounts) {
        countMap[t.user_id] = (countMap[t.user_id] || 0) + 1;
      }
    }

    // emailマップを作成
    const emailMap: Record<string, string> = {};
    if (authData?.users) {
      for (const authUser of authData.users) {
        if (authUser.email) {
          emailMap[authUser.id] = authUser.email;
        }
      }
    }

    // profilesとauthデータをマージ
    const users = (profiles || []).map((profile: any) => ({
      id: profile.id,
      email: emailMap[profile.id] || "",
      username: profile.username,
      avatar_url: profile.avatar_url,
      is_admin: profile.is_admin,
      is_banned: profile.is_banned,
      created_at: profile.created_at,
      trivia_count: countMap[profile.id] || 0,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
