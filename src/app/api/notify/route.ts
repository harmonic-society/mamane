import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type NotificationType = "hee" | "favorite" | "comment" | "new_post";

interface NotifyRequest {
  type: NotificationType;
  triviaId: string;
  triviaTitle: string;
  recipientUserId: string;
  actorUsername?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 環境変数チェック
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json({ error: "Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json({ error: "Server configuration error: missing RESEND_API_KEY" }, { status: 500 });
    }

    // Service Role Keyを使用してAdmin権限でSupabaseに接続
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { type, triviaId, triviaTitle, recipientUserId, actorUsername }: NotifyRequest = await request.json();
    console.log("Notify request:", { type, triviaId, triviaTitle, recipientUserId, actorUsername });

    // 受信者のメールアドレスを取得（Admin APIを使用）
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(recipientUserId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      return NextResponse.json({ error: "User not found", details: userError?.message }, { status: 404 });
    }

    const recipientEmail = userData.user.email;
    console.log("Sending email to:", recipientEmail);

    // 受信者のプロフィールを取得（通知設定も含む）
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username, email_notifications")
      .eq("id", recipientUserId)
      .single() as { data: { username: string; email_notifications: boolean | null } | null; error: any };

    // 通知がオフの場合は送信しない
    if (profile?.email_notifications === false) {
      return NextResponse.json({ success: true, skipped: true, reason: "notifications_disabled" });
    }

    const recipientName = profile?.username || "ユーザー";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rasher.jp";
    const triviaUrl = `${siteUrl}/trivia/${triviaId}`;
    const unsubscribeUrl = `${siteUrl}/user/${recipientUserId}?tab=settings`;

    const footerHtml = `
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px;">
        この通知は <a href="${siteUrl}" style="color: #EC4899;">rasher</a> から送信されました。<br />
        <a href="${unsubscribeUrl}" style="color: #888;">通知設定を変更する</a>
      </p>
    `;

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "hee":
        subject = `🐬 ${actorUsername}さんがあなたの豆知識にラッシャー！しました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">🐬 rasher - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p><strong>${actorUsername}</strong>さんがあなたの豆知識「<strong>${triviaTitle}</strong>」にラッシャー！しました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">豆知識を見る</a></p>
            ${footerHtml}
          </div>
        `;
        break;

      case "favorite":
        subject = `⭐ ${actorUsername}さんがあなたの豆知識をお気に入りしました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">🐬 rasher - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p><strong>${actorUsername}</strong>さんがあなたの豆知識「<strong>${triviaTitle}</strong>」をお気に入りに追加しました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">豆知識を見る</a></p>
            ${footerHtml}
          </div>
        `;
        break;

      case "comment":
        subject = `💬 ${actorUsername}さんがあなたの豆知識にコメントしました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">🐬 rasher - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p><strong>${actorUsername}</strong>さんがあなたの豆知識「<strong>${triviaTitle}</strong>」にコメントしました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">コメントを見る</a></p>
            ${footerHtml}
          </div>
        `;
        break;

      case "new_post":
        subject = `📝 新しい豆知識が投稿されました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">🐬 rasher - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p>新しい豆知識「<strong>${triviaTitle}</strong>」が投稿されました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">豆知識を見る</a></p>
            ${footerHtml}
          </div>
        `;
        break;

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    // メール送信
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "rasher <noreply@rasher.jp>",
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log("Email sent successfully:", data?.id);
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
