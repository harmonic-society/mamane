import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <>
      <Header user={profile} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
