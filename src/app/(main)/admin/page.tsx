"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Users,
  FileText,
  Tag,
  Trash2,
  Ban,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  X,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
  trivia_count: number;
}

interface Trivia {
  id: string;
  title: string;
  hee_count: number;
  created_at: string;
  author_username: string;
  author_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Stats {
  totalUsers: number;
  totalTrivia: number;
  totalHee: number;
  totalCategories: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalTrivia: 0, totalHee: 0, totalCategories: 0 });

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  // Trivia
  const [triviaList, setTriviaList] = useState<Trivia[]>([]);
  const [showTrivia, setShowTrivia] = useState(false);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", icon: "", color: "#EC4899" });
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single() as { data: { is_admin: boolean } | null };

      if (!profile?.is_admin) {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      await fetchStats();
      setIsLoading(false);
    };

    checkAdmin();
  }, [router]);

  const fetchStats = async () => {
    const supabase = createClient();

    const [usersResult, triviaResult, categoriesResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("trivia").select("id, hee_count"),
      supabase.from("categories").select("id", { count: "exact" }),
    ]);

    const totalHee = (triviaResult.data || []).reduce((sum: number, t: any) => sum + (t.hee_count || 0), 0);

    setStats({
      totalUsers: usersResult.count || 0,
      totalTrivia: triviaResult.data?.length || 0,
      totalHee,
      totalCategories: categoriesResult.count || 0,
    });
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        console.error("ユーザー取得エラー");
        return;
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("ユーザー取得エラー:", error);
    }
  };

  const fetchTrivia = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("trivia")
      .select(`
        id,
        title,
        hee_count,
        created_at,
        user_id,
        profiles!inner (username)
      `)
      .order("created_at", { ascending: false })
      .limit(100) as { data: any[] | null };

    if (data) {
      setTriviaList(
        data.map((t) => ({
          id: t.id,
          title: t.title,
          hee_count: t.hee_count,
          created_at: t.created_at,
          author_username: t.profiles.username,
          author_id: t.user_id,
        }))
      );
    }
  };

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (data) {
      setCategories(data);
    }
  };

  const handleBanUser = async (userId: string, currentBanned: boolean) => {
    if (!confirm(currentBanned ? "このユーザーのBANを解除しますか？" : "このユーザーをBANしますか？")) return;

    try {
      const response = await fetch("/api/admin/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isBanned: !currentBanned }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`エラー: ${result.error}${result.details ? `\n詳細: ${result.details}` : ""}`);
        return;
      }

      fetchUsers();
    } catch (error) {
      console.error("BAN処理エラー:", error);
      alert("BAN処理に失敗しました");
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    if (!confirm("このユーザーのメールを手動で確認済みにしますか？")) return;

    try {
      const response = await fetch("/api/admin/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`エラー: ${result.error}${result.details ? `\n詳細: ${result.details}` : ""}`);
        return;
      }

      alert("メール確認状態を更新しました");
      fetchUsers();
    } catch (error) {
      console.error("メール確認処理エラー:", error);
      alert("メール確認処理に失敗しました");
    }
  };

  const handleResendVerification = async (userId: string, email: string) => {
    if (!confirm(`${email} に確認メールを再送信しますか？`)) return;

    try {
      const response = await fetch("/api/admin/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(`エラー: ${result.error}${result.details ? `\n詳細: ${result.details}` : ""}`);
        return;
      }

      alert("確認メールを送信しました");
    } catch (error) {
      console.error("確認メール送信エラー:", error);
      alert("確認メールの送信に失敗しました");
    }
  };

  const handleDeleteTrivia = async (triviaId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;

    const supabase = createClient();
    await supabase.from("trivia").delete().eq("id", triviaId);

    fetchTrivia();
    fetchStats();
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug || !newCategory.icon) {
      alert("すべての項目を入力してください");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      name: newCategory.name,
      slug: newCategory.slug,
      icon: newCategory.icon,
      color: newCategory.color,
      sort_order: categories.length + 1,
    } as any);

    if (error) {
      alert("カテゴリの追加に失敗しました");
      return;
    }

    setNewCategory({ name: "", slug: "", icon: "", color: "#EC4899" });
    setIsAddingCategory(false);
    fetchCategories();
    fetchStats();
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("このカテゴリを削除しますか？関連する投稿のカテゴリは未設定になります。")) return;

    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", categoryId);

    fetchCategories();
    fetchStats();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-pink-500" />
        <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">ユーザー数</span>
          </div>
          <p className="text-2xl font-bold text-pink-500">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">投稿数</span>
          </div>
          <p className="text-2xl font-bold text-pink-500">{stats.totalTrivia}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <span className="text-sm">総ラッシャー数</span>
          </div>
          <p className="text-2xl font-bold text-pink-500">{stats.totalHee.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Tag className="w-4 h-4" />
            <span className="text-sm">カテゴリ数</span>
          </div>
          <p className="text-2xl font-bold text-pink-500">{stats.totalCategories}</p>
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-xl shadow mb-4">
        <button
          onClick={() => {
            setShowUsers(!showUsers);
            if (!showUsers && users.length === 0) fetchUsers();
          }}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            <span className="font-medium">ユーザー管理</span>
          </div>
          {showUsers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showUsers && (
          <div className="border-t px-4 pb-4">
            <div className="space-y-2 mt-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    user.is_banned ? "bg-red-50" : "bg-gray-50"
                  }`}
                >
                  <Link href={`/user/${user.id}`} className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-pink-500 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium flex items-center gap-2 flex-wrap">
                        {user.username}
                        {user.is_admin && (
                          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                            管理者
                          </span>
                        )}
                        {user.is_banned && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            BAN
                          </span>
                        )}
                        {user.email_confirmed_at ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                            確認済み
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">
                            未確認
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">投稿数: {user.trivia_count}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {!user.email_confirmed_at && (
                      <>
                        <button
                          onClick={() => handleVerifyEmail(user.id)}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                          title="手動で確認済みにする"
                        >
                          <MailCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResendVerification(user.id, user.email)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="確認メールを再送信"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {!user.is_admin && (
                      <button
                        onClick={() => handleBanUser(user.id, user.is_banned)}
                        className={`p-2 rounded-lg ${
                          user.is_banned
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                        title={user.is_banned ? "BAN解除" : "BAN"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trivia Section */}
      <div className="bg-white rounded-xl shadow mb-4">
        <button
          onClick={() => {
            setShowTrivia(!showTrivia);
            if (!showTrivia && triviaList.length === 0) fetchTrivia();
          }}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            <span className="font-medium">投稿管理</span>
          </div>
          {showTrivia ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showTrivia && (
          <div className="border-t px-4 pb-4">
            <div className="space-y-2 mt-4">
              {triviaList.map((trivia) => (
                <div
                  key={trivia.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <Link href={`/trivia/${trivia.id}`} className="flex-1">
                    <p className="font-medium line-clamp-1">{trivia.title}</p>
                    <p className="text-sm text-gray-500">
                      by {trivia.author_username} / {trivia.hee_count} ラッシャー
                    </p>
                  </Link>
                  <button
                    onClick={() => handleDeleteTrivia(trivia.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-white rounded-xl shadow mb-4">
        <button
          onClick={() => {
            setShowCategories(!showCategories);
            if (!showCategories && categories.length === 0) fetchCategories();
          }}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-pink-500" />
            <span className="font-medium">カテゴリ管理</span>
          </div>
          {showCategories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showCategories && (
          <div className="border-t px-4 pb-4">
            {/* Add Category Button */}
            {!isAddingCategory && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="mt-4 flex items-center gap-2 text-pink-500 hover:text-pink-600"
              >
                <Plus className="w-4 h-4" />
                <span>カテゴリを追加</span>
              </button>
            )}

            {/* Add Category Form */}
            {isAddingCategory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="名前（例: テクノロジー）"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="スラッグ（例: tech）"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="アイコン（例: 💻）"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    <Save className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={() => setIsAddingCategory(false)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-2 mt-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: category.color + "20" }}
                    >
                      {category.icon}
                    </span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
