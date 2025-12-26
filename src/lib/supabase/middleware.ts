import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // BANされたユーザーをログアウトさせる
  if (user) {
    const profileResult = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();

    console.log("BAN check - user:", user.id, "result:", profileResult.data, "error:", profileResult.error);

    const profile = profileResult.data as { is_banned: boolean | null } | null;

    if (profile?.is_banned === true) {
      console.log("User is BANNED, logging out:", user.id);
      // BANされている場合はセッションを削除してログインページにリダイレクト
      await supabase.auth.signOut();
      const bannedUrl = new URL("/login", request.url);
      bannedUrl.searchParams.set("error", "banned");
      return NextResponse.redirect(bannedUrl);
    }
  }

  return response;
}
