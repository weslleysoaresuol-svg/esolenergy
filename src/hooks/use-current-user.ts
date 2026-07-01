import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "admin" | "corretor" | "auxiliar" | "atendente" | "vendedor" | "engenheiro" | "pos_vendas" | "financeiro";

export type CurrentUser = {
  user: User | null;
  role: AppRole | null;
  profile: any | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    setUser(u.user ?? null);
    if (u.user) {
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      ]);
      const roles = (r ?? []).map((row: any) => row.role as AppRole);
      let resolved: AppRole | null = roles.includes("admin")
        ? "admin"
        : roles.includes("auxiliar")
          ? "auxiliar"
          : roles.includes("atendente")
            ? "atendente"
            : roles.includes("vendedor")
              ? "vendedor"
              : roles.includes("engenheiro")
                ? "engenheiro"
                : roles.includes("pos_vendas")
                  ? "pos_vendas"
                  : roles.includes("financeiro")
                    ? "financeiro"
                    : roles.includes("corretor")
                      ? "corretor"
                      : null;

      // Override temporário de segurança para recuperar acesso do proprietário imediatamente
      if (u.user.email?.toLowerCase() === "eng.weslleysoares@gmail.com") {
        resolved = "admin";
        if (p) {
          p.ativo = true;
        } else {
          p = { id: u.user.id, email: u.user.email, nome: "Weslley Soares", ativo: true };
        }
      }

      setRole(resolved);
      setProfile(p ?? null);
    } else {
      setRole(null);
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, role, profile, loading, refresh: load };
}
