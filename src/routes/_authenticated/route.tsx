import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    // Being logged in is not the same as being an admin. Every route under
    // _authenticated is admin-only, so we also confirm an 'admin' row exists
    // for this user in user_roles (readable via its own RLS policy: "Users
    // can view their own roles"). Without this check, any signed-up user
    // could open /admin directly — the page would render, even though the
    // underlying scam_reports queries are separately blocked by RLS.
    const { data: roles, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roles) {
      await supabase.auth.signOut();
      throw redirect({ to: "/login", search: { unauthorized: true } });
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
