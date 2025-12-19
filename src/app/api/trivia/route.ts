import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "0");
  const limit = 20;
  const offset = page * limit;

  const supabase = createClient();

  const { data: triviaData, error } = await supabase
    .from("trivia")
    .select(
      `
      id,
      title,
      content,
      hee_count,
      created_at,
      user_id,
      category_id,
      profiles!inner (
        id,
        username,
        avatar_url
      ),
      categories (
        id,
        name,
        slug,
        icon,
        color
      ),
      comments (
        id
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const triviaList = (triviaData || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    hee_count: item.hee_count,
    comment_count: item.comments?.length || 0,
    created_at: item.created_at,
    author_id: item.profiles.id,
    author_username: item.profiles.username,
    author_avatar: item.profiles.avatar_url,
    category_id: item.categories?.id || null,
    category_name: item.categories?.name || null,
    category_slug: item.categories?.slug || null,
    category_icon: item.categories?.icon || null,
    category_color: item.categories?.color || null,
  }));

  return NextResponse.json({
    data: triviaList,
    hasMore: triviaList.length === limit,
  });
}
