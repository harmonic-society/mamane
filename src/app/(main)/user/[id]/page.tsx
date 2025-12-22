"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Calendar, Users, Heart, LogOut, Loader2, Save, Camera, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const AGE_GROUPS = [
  "10代",
  "20代",
  "30代",
  "40代",
  "50代",
  "60代以上",
];

const GENDERS = [
  "男性",
  "女性",
  "その他",
  "回答しない",
];

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  age_group: string | null;
  gender: string | null;
  interests: string | null;
}

interface UserTrivia {
  id: string;
  title: string;
  hee_count: number;
  created_at: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [userTrivia, setUserTrivia] = useState<UserTrivia[]>([]);

  // 編集用state
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // プロフィールを取得
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        setError("プロフィールが見つかりません");
        setIsLoading(false);
        return;
      }

      const profile = profileData as Profile;
      setProfile(profile);
      setAgeGroup(profile.age_group || "");
      setGender(profile.gender || "");
      setInterests(profile.interests || "");

      // ユーザーの投稿を取得
      const { data: triviaData } = await supabase
        .from("trivia")
        .select("id, title, hee_count, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (triviaData) {
        setUserTrivia(triviaData as UserTrivia[]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [userId]);

  const handleAvatarClick = () => {
    if (currentUserId === userId && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("画像サイズは2MB以下にしてください");
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    setIsUploadingAvatar(true);
    setError("");

    const supabase = createClient();

    // ファイル名を生成
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 古いアバターを削除（存在する場合）
    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split("/").pop();
      if (oldPath) {
        await supabase.storage.from("avatars").remove([`avatars/${oldPath}`]);
      }
    }

    // 新しいアバターをアップロード
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setError("画像のアップロードに失敗しました");
      setIsUploadingAvatar(false);
      return;
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // プロフィールを更新
    const { error: updateError } = await (supabase
      .from("profiles") as any)
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) {
      setError("プロフィールの更新に失敗しました");
    } else {
      setProfile({
        ...profile!,
        avatar_url: publicUrl,
      });
    }

    setIsUploadingAvatar(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();

    const updateData = {
      age_group: ageGroup || null,
      gender: gender || null,
      interests: interests.trim() || null,
    };

    const { error } = await (supabase
      .from("profiles") as any)
      .update(updateData)
      .eq("id", userId);

    if (error) {
      setError("保存に失敗しました");
    } else {
      setProfile({
        ...profile!,
        age_group: ageGroup,
        gender,
        interests,
      });
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isOwner = currentUserId === userId;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* ヘッダー */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={handleAvatarClick}
              disabled={!isOwner || isUploadingAvatar}
              className={`
                w-24 h-24 rounded-full overflow-hidden shadow-lg
                ${isOwner ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                transition-opacity relative
              `}
            >
              {isUploadingAvatar ? (
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              ) : profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">
                    {profile?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>
            {isOwner && !isUploadingAvatar && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-pink-400">
                <Camera className="w-4 h-4 text-pink-500" />
              </div>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">マイページ</h1>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* 名前 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-1">名前</label>
              <p className="text-gray-800 font-medium">{profile?.username || "未設定"}</p>
            </div>
          </div>

          {/* 年代 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-1">年代</label>
              {isEditing ? (
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">選択してください</option>
                  {AGE_GROUPS.map((age) => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800">{profile?.age_group || "未設定"}</p>
              )}
            </div>
          </div>

          {/* 性別 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-1">性別</label>
              {isEditing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">選択してください</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-800">{profile?.gender || "未設定"}</p>
              )}
            </div>
          </div>

          {/* 興味のあるもの */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-2">興味のあるもの</label>
              {isEditing ? (
                <textarea
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="例：音楽、映画、旅行、料理..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none resize-none"
                />
              ) : (
                <p className="text-gray-800">{profile?.interests || "未設定"}</p>
              )}
            </div>
          </div>
        </div>

        {/* ボタン */}
        {isOwner && (
          <div className="mt-8 space-y-3">
            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  保存する
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setAgeGroup(profile?.age_group || "");
                    setGender(profile?.gender || "");
                    setInterests(profile?.interests || "");
                  }}
                  className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-400 to-pink-600 text-white font-medium hover:shadow-lg transition-shadow"
              >
                プロフィールを編集
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>
        )}
      </div>

      {/* 投稿した豆知識一覧 */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-pink-500" />
          投稿した豆知識
          <span className="text-sm font-normal text-gray-400">
            ({userTrivia.length})
          </span>
        </h2>

        {userTrivia.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userTrivia.map((trivia) => (
              <Link
                key={trivia.id}
                href={`/trivia/${trivia.id}`}
                className="block p-4 rounded-lg border border-gray-100 hover:border-pink-200 hover:bg-pink-50/50 transition-colors"
              >
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                  {trivia.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    {formatDistanceToNow(new Date(trivia.created_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                  <span className="text-pink-500">
                    🐬 {trivia.hee_count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
