export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          total_hee_received: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          total_hee_received?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          total_hee_received?: number;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon: string;
          color: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string;
          color?: string;
          sort_order?: number;
        };
      };
      trivia: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          content: string;
          hee_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          content: string;
          hee_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          title?: string;
          content?: string;
          hee_count?: number;
          created_at?: string;
        };
      };
      hee_reactions: {
        Row: {
          id: string;
          trivia_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trivia_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trivia_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          trivia_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trivia_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trivia_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// 便利な型エイリアス
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Trivia = Database["public"]["Tables"]["trivia"]["Row"];
export type HeeReaction = Database["public"]["Tables"]["hee_reactions"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];

// コメントの詳細情報（結合データ）
export interface CommentWithAuthor {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_username: string;
  author_avatar: string | null;
}

// 豆知識の詳細情報（結合データ）
export interface TriviaWithDetails {
  id: string;
  title: string;
  content: string;
  hee_count: number;
  comment_count: number;
  created_at: string;
  author_id: string;
  author_username: string;
  author_avatar: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  category_icon: string | null;
  category_color: string | null;
}
