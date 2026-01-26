import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "無効なリクエスト" }, { status: 400 });
    }

    // 管理者クライアントでメール確認を自動実行
    const adminSupabase = createAdminClient();

    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Auto verify error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auto verify API error:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
