import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, content } = await request.json();

    if (!name || !email || !content) {
      return NextResponse.json(
        { error: "全ての項目を入力してください" },
        { status: 400 }
      );
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      content,
    });

    if (error) {
      console.error("Contact insert error:", error);
      return NextResponse.json(
        { error: "送信に失敗しました" },
        { status: 500 }
      );
    }

    // メール送信
    try {
      await resend.emails.send({
        from: "Rasher <noreply@resend.dev>",
        to: ["yokoyama@harmonic-society.co.jp", "morota@harmonic-society.co.jp"],
        subject: `【Rasher】お問い合わせ: ${name}様`,
        html: `
          <h2>Rasherにお問い合わせがありました</h2>
          <p><strong>お名前:</strong> ${name}</p>
          <p><strong>メールアドレス:</strong> ${email}</p>
          <p><strong>内容:</strong></p>
          <p style="white-space: pre-wrap;">${content}</p>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // メール送信失敗してもDBには保存済みなので成功扱い
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "サーバーエラー" },
      { status: 500 }
    );
  }
}
