import Link from "next/link";

interface CategoryBadgeProps {
  name: string;
  slug: string;
  icon: string;
  color: string;
  clickable?: boolean;
}

export function CategoryBadge({
  name,
  slug,
  icon,
  color,
  clickable = true,
}: CategoryBadgeProps) {
  const badge = (
    <span
      className={`
        inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
        ${clickable ? "hover:opacity-80 transition-opacity" : ""}
      `}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </span>
  );

  if (clickable) {
    return <Link href={`/category/${slug}`}>{badge}</Link>;
  }

  return badge;
}
