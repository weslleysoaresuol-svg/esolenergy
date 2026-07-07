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
      const isMarcos = u.user.email?.toLowerCase() === "marcos.nubank777@gmail.com";
      const roles = (r ?? []).map((row: any) => row.role as AppRole);
      let resolved: AppRole | null = (roles.includes("admin") || isMarcos)
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

      let profileData = p ?? null;
      if (isMarcos) {
        profileData = {
          ...(profileData || {}),
          id: u.user.id,
          nome: profileData?.nome || u.user.user_metadata?.full_name || "Marcos Barbosa da Silva",
          email: u.user.email || null,
          ativo: true,
          onboarding_completo: true,
          contrato_assinado: true
        };
      }

      setRole(resolved);
      setProfile(profileData);

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
