import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import type { CommentWithAuthor } from "@/types/database";
import { MessageCircle } from "lucide-react";

interface CommentListProps {
  comments: CommentWithAuthor[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>まだコメントはありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <Link href={`/user/${comment.author_id}`} className="flex-shrink-0">
            {comment.author_avatar ? (
              <Image
                src={comment.author_avatar}
                alt={comment.author_username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-sm font-medium text-white">
                {comment.author_username.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/user/${comment.author_id}`}
                className="font-medium text-gray-800 hover:text-pink-600 transition-colors"
              >
                {comment.author_username}
              </Link>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
