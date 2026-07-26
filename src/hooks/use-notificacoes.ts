import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "./use-current-user";
import { toast } from "sonner";

export interface Notificacao {
  id: string;
  tipo: "novo_lead" | "proposta_aceita" | "proposta_visualizada" | "lead_frio" | "proposta_expirando" | string;
  titulo: string;
  mensagem: string;
  dados: Record<string, any>;
  lida: boolean;
  created_at: string;
}

const TIPO_ICON: Record<string, string> = {
  novo_lead:           "🎯",
  proposta_aceita:     "🎉",
  proposta_visualizada:"👀",
  lead_frio:           "⏰",
  proposta_expirando:  "⚠️",
};

export function useNotificacoes() {
  const { user } = useCurrentUser();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const pushPermission = useRef<NotificationPermission>("default");

  // Carrega histórico do banco
  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notificacoes" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);
    const list = ((data as any) || []) as Notificacao[];
    setNotificacoes(list);
    setNaoLidas(list.filter((n) => !n.lida).length);
  }, [user]);

  // Pede permissão de push ao browser (1x, silencioso)
  const requestPushPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      pushPermission.current = perm;
    } else {
      pushPermission.current = Notification.permission;
    }
  }, []);

  // Dispara notificação nativa do browser
  const dispararBrowserPush = useCallback((notif: Notificacao) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    // Não dispara se a janela está em foco
    if (document.visibilityState === "visible") return;
    try {
      new Notification(notif.titulo, {
        body: notif.mensagem,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: notif.id, // evita duplicatas
      });
    } catch {
      // ignora erros silenciosamente (ex: browser não suporta)
    }
  }, []);

  // Subscription WebSocket em tempo real
  useEffect(() => {
    if (!user) return;

    load();
    requestPushPermission();

    const channel = supabase
      .channel(`notif_user_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notificacoes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const nova = payload.new as Notificacao;

          // Atualiza estado local (sem precisar recarregar)
          setNotificacoes((prev) => [nova, ...prev].slice(0, 40));
          setNaoLidas((prev) => prev + 1);

          // Toast no app
          const icon = TIPO_ICON[nova.tipo] || "🔔";
          toast(nova.titulo, {
            description: nova.mensagem,
            duration: 7000,
            icon,
          });

          // Push nativo do browser (funciona com aba minimizada)
          dispararBrowserPush(nova);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notificacoes",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Sincroniza marcação de lida
          const updated = payload.new as Notificacao;
          setNotificacoes((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, lida: updated.lida } : n))
          );
          if (updated.lida) {
            setNaoLidas((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, load, requestPushPermission, dispararBrowserPush]);

  const marcarLida = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("notificacoes" as any)
      .update({ lida: true })
      .eq("id", id);
    if (!error) {
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setNaoLidas((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const marcarTodasLidas = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("notificacoes" as any)
      .update({ lida: true })
      .eq("user_id", user.id)
      .eq("lida", false);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
  }, [user]);

  const excluirNotificacao = useCallback(async (id: string) => {
    await supabase.from("notificacoes" as any).delete().eq("id", id);
    setNotificacoes((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.lida) setNaoLidas((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  return {
    notificacoes,
    naoLidas,
    marcarLida,
    marcarTodasLidas,
    excluirNotificacao,
    requestPushPermission,
    reload: load,
  };
}
