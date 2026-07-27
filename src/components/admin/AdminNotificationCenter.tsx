import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Trash2,
  DollarSign,
  Zap,
  ShieldAlert,
  Info,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface NotificationItem {
  id: string;
  titulo: string;
  mensagem: string;
  categoria: "financeiro" | "engenharia" | "seguranca" | "sistema";
  lida: boolean;
  criadoEm: string;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    titulo: "Saque PIX Solicitado",
    mensagem: "Consultor solicitou saque de R$ 4.850,00 referente a comissão MMN.",
    categoria: "financeiro",
    lida: false,
    criadoEm: "Há 5 minutos",
  },
  {
    id: "notif-2",
    titulo: "Parecer de Acesso ANEEL Aprovado",
    mensagem: "Projeto EPC #1042 aprovado pela concessionária Enel SP.",
    categoria: "engenharia",
    lida: false,
    criadoEm: "Há 18 minutos",
  },
  {
    id: "notif-3",
    titulo: "Alerta de Tentativa de Login RBAC",
    mensagem: "Tentativa de login suspeita bloqueada no IP 189.40.12.9.",
    categoria: "seguranca",
    lida: true,
    criadoEm: "Há 1 hora",
  },
  {
    id: "notif-4",
    titulo: "NFe Emitida com Sucesso",
    mensagem: "Nota Fiscal de Serviço #4092 transmitida para eNotas SEFAZ.",
    categoria: "financeiro",
    lida: true,
    criadoEm: "Há 3 horas",
  },
];

export interface AdminNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNotificationCenter({ isOpen, onClose }: AdminNotificationCenterProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = React.useState<"todas" | "financeiro" | "engenharia" | "seguranca">("todas");

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "todas") return true;
    return n.categoria === activeTab;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: !n.lida } : n))
    );
  };

  const getCategoryIcon = (categoria: NotificationItem["categoria"]) => {
    switch (categoria) {
      case "financeiro":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "engenharia":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "seguranca":
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-cyan-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card/95 border-l border-border/80 shadow-2xl backdrop-blur-2xl flex flex-col dark:bg-slate-950/95 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-500 font-bold glow-amber">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    Central de Notificações
                    {unreadCount > 0 && (
                      <Badge variant="sun" className="text-[10px]">
                        {unreadCount} novas
                      </Badge>
                    )}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Alertas do Sistema & Eventos em Tempo Real</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1 p-2 border-b border-border/40 bg-background/50 text-xs font-semibold overflow-x-auto scrollbar-none">
              {(["todas", "financeiro", "engenharia", "seguranca"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap",
                    activeTab === tab
                      ? "bg-amber-400 text-slate-950 font-bold shadow-sm glow-amber"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
              {filteredNotifications.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-xs font-semibold text-muted-foreground">Nenhuma notificação encontrada</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleRead(item.id)}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer relative group",
                      item.lida
                        ? "bg-background/40 border-border/40 text-muted-foreground"
                        : "bg-card border-amber-400/40 shadow-sm glow-amber/10 text-foreground dark:bg-slate-900/80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-accent/60 shrink-0 mt-0.5">
                        {getCategoryIcon(item.categoria)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold truncate text-foreground">{item.titulo}</h4>
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.criadoEm}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.mensagem}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-border/60 bg-background/50 flex items-center justify-between text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Marcar todas como lidas</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Limpar</span>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
