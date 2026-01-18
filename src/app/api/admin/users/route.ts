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

    // profilesマップを作成
    const profileMap: Record<string, any> = {};
    if (profiles) {
      for (const profile of profiles) {
        profileMap[profile.id] = profile;
      }
    }

    // Auth usersを基準にマージ（メール未確認ユーザーも含める）
    const users = (authData?.users || []).map((authUser: any) => {
      const profile = profileMap[authUser.id];
      return {
        id: authUser.id,
        email: authUser.email || "",
        email_confirmed_at: authUser.email_confirmed_at || null,
        username: profile?.username || authUser.email?.split("@")[0] || "未設定",
        avatar_url: profile?.avatar_url || null,
        is_admin: profile?.is_admin || false,
        is_banned: profile?.is_banned || false,
        created_at: authUser.created_at,
        trivia_count: countMap[authUser.id] || 0,
      };
    }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ users });
  } catch (error) {
    console.error("API エラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
