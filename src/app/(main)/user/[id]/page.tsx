"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Image as ImageIcon, Calendar, Users, Heart, LogOut, Loader2, Save } from "lucide-react";
import Link from "next/link";

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

const INTERESTS = [
  "雑学",
  "科学",
  "歴史",
  "生活",
  "動物",
  "食べ物",
  "スポーツ",
  "音楽",
  "映画",
  "ゲーム",
  "テクノロジー",
  "アート",
];

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  age_group: string | null;
  gender: string | null;
  interests: string[] | null;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // 編集用state
  const [username, setUsername] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

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

      if (profileError) {
        setError("プロフィールが見つかりません");
        setIsLoading(false);
        return;
      }

      setProfile(profileData);
      setUsername(profileData.username || "");
      setAgeGroup(profileData.age_group || "");
      setGender(profileData.gender || "");
      setInterests(profileData.interests || []);
      setIsLoading(false);
    };

    fetchData();
  }, [userId]);

  const handleInterestToggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        age_group: ageGroup || null,
        gender: gender || null,
        interests: interests.length > 0 ? interests : null,
      })
      .eq("id", userId);

    if (error) {
      setError("保存に失敗しました");
    } else {
      setProfile({
        ...profile!,
        username,
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
          <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl text-white font-bold">
              {profile?.username?.charAt(0).toUpperCase()}
            </span>
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
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none"
                />
              ) : (
                <p className="text-gray-800 font-medium">{profile?.username || "未設定"}</p>
              )}
            </div>
          </div>

          {/* アイコン */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-1">アイコン</label>
              <p className="text-gray-400 text-sm">頭文字が自動で表示されます</p>
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
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        interests.includes(interest)
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">未設定</p>
                  )}
                </div>
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
                    setUsername(profile?.username || "");
                    setAgeGroup(profile?.age_group || "");
                    setGender(profile?.gender || "");
                    setInterests(profile?.interests || []);
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
    </div>
  );
}
