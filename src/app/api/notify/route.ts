import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type NotificationType = "hee" | "favorite" | "new_post";

interface NotifyRequest {
  type: NotificationType;
  triviaId: string;
  triviaTitle: string;
  recipientUserId: string;
  actorUsername?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { type, triviaId, triviaTitle, recipientUserId, actorUsername }: NotifyRequest = await request.json();

    // 受信者のメールアドレスを取得
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(recipientUserId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recipientEmail = userData.user.email;

    // 受信者のプロフィールを取得（通知設定も含む）
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, email_notifications")
      .eq("id", recipientUserId)
      .single() as { data: { username: string; email_notifications: boolean | null } | null; error: any };

    // 通知がオフの場合は送信しない
    if (profile?.email_notifications === false) {
      return NextResponse.json({ success: true, skipped: true, reason: "notifications_disabled" });
    }

    const recipientName = profile?.username || "ユーザー";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mamane.vercel.app";
    const triviaUrl = `${siteUrl}/trivia/${triviaId}`;

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "hee":
        subject = `${actorUsername}さんがあなたの豆知識にラッシャー！しました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">mamane - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p><strong>${actorUsername}</strong>さんがあなたの豆知識「<strong>${triviaTitle}</strong>」にラッシャー！しました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">豆知識を見る</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">この通知はmamaneから送信されました。</p>
          </div>
        `;
        break;

      case "favorite":
        subject = `${actorUsername}さんがあなたの豆知識をお気に入りしました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">mamane - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p><strong>${actorUsername}</strong>さんがあなたの豆知識「<strong>${triviaTitle}</strong>」をお気に入りに追加しました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">豆知識を見る</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">この通知はmamaneから送信されました。</p>
          </div>
        `;
        break;

      case "new_post":
        subject = `新しい豆知識が投稿されました`;
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EC4899;">mamane - 豆知識共有サイト</h2>
            <p>${recipientName}さん、</p>
            <p>新しい豆知識「<strong>${triviaTitle}</strong>」が投稿されました！</p>
            <p><a href="${triviaUrl}" style="display: inline-block; background: linear-gradient(to right, #F472B6, #EC4899); color: white; padding: 12px 24px; border-radius: 9999px; text-decoration: none;">豆知識を見る</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px;">この通知はmamaneから送信されました。</p>
          </div>
        `;
        break;

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    // メール送信
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "mamane <noreply@mamane.app>",
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
