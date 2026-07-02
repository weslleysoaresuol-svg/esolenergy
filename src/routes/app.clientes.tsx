import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Users, Loader2, Filter, Search, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/clientes")({
  head: () => ({ meta: [{ title: "Clientes & Leads — ESOL Energy" }] }),
  component: AdminClientes,
});

const BOARD_COLUMNS = [
  { label: "Leads recebidas", statuses: ["novo"], key: "recebidas", color: "bg-blue-500" },
  { label: "Leads em atendimento", statuses: ["contato"], key: "atendimento", color: "bg-indigo-500" },
  { label: "Leads em proposta", statuses: ["visita_agendada", "proposta_enviada"], key: "proposta", color: "bg-amber-500" },
  { label: "Leads em negociação", statuses: ["negociacao"], key: "negociacao", color: "bg-purple-500" },
  { label: "Leads fechadas", statuses: ["contrato_assinado", "instalacao", "concluido"], key: "fechadas", color: "bg-emerald-500" }
];

function AdminClientes() {
  const { user } = useCurrentUser();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCorretor, setFilterCorretor] = useState("todos");
  const [corretores, setCorretores] = useState<any[]>([]);

  // Modal Novo Lead
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("novo");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [uf, setUf] = useState("");
  const [cidade, setCidade] = useState("");
  const [ufsList, setUfsList] = useState<any[]>([]);
  const [cidadesList, setCidadesList] = useState<any[]>([]);
  const [savingLead, setSavingLead] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    // Tenta com join no profiles
    const { data, error } = await supabase
      .from("clientes")
      .select("*, profiles:corretor_id(nome)")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.warn("Erro no relacionamento do profiles em clientes. Usando fallback seguro...", error);
      // Fallback robusto sem join
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallbackError) {
        console.error("Erro no fallback de clientes:", fallbackError);
        setErrorMsg(`Erro: ${fallbackError.message}`);
      } else {
        setClientes(fallbackData || []);
      }
    } else {
      setClientes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClientes();

    // Carrega a lista de corretores para o filtro
    (async () => {
      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "corretor");
        const ids = (roles || []).map((r: any) => r.user_id);
        if (ids.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, nome")
            .in("id", ids);
          setCorretores(profs || []);
        }
      } catch (err) {
        console.error("Erro ao buscar corretores para filtro:", err);
      }
    })();

    // Carrega UFs do IBGE
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?ordenar=nome")
      .then((res) => res.json())
      .then((data) => setUfsList(data))
      .catch((err) => console.error("Erro ao buscar UFs:", err));
  }, []);

  // Carrega cidades da UF selecionada
  useEffect(() => {
    if (!uf) {
      setCidadesList([]);
      setCidade("");
      return;
    }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?ordenar=nome`)
      .then((res) => res.json())
      .then((data) => setCidadesList(data))
      .catch((err) => console.error("Erro ao buscar cidades:", err));
  }, [uf]);

  const handleOpenModal = (status: string) => {
    setTargetStatus(status);
    setNome("");
    setEmail("");
    setTelefone("");
    setUf("");
    setCidade("");
    setModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) {
      toast.error("Nome e celular são campos obrigatórios!");
      return;
    }

    setSavingLead(true);
    try {
      // Fallback seguro de ID se não puder usar crypto.randomUUID
      const randomId = typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      const ufNome = ufsList.find((x) => x.sigla === uf)?.nome || uf;

      const { error } = await (supabase.from as any)("clientes").insert({
        id: randomId,
        nome,
        email: email || null,
        telefone,
        estado: ufNome || null,
        cidade: cidade || null,
        status: targetStatus,
        corretor_id: user?.id || null
      });

      if (error) throw error;

      toast.success("Lead cadastrado com sucesso!");
      setModalOpen(false);
      fetchClientes();
    } catch (err: any) {
      console.error("Erro ao salvar lead:", err);
      toast.error(`Erro ao salvar lead: ${err.message}`);
    } finally {
      setSavingLead(false);
    }
  };

  // Filtra os clientes locais
  const filteredClientes = clientes.filter((c) => {
    const matchesSearch = !searchTerm || 
      c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.telefone?.includes(searchTerm) || 
      c.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCorretor = filterCorretor === "todos" || c.corretor_id === filterCorretor;

    return matchesSearch && matchesCorretor;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1">
      {/* Topo / Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Acompanhar suas leads</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gerenciamento visual e segmentado dos clientes ESOL Energy</p>
        </div>
        <button
          onClick={() => handleOpenModal("novo")}
          className="bg-[#2E44B8] hover:bg-[#1F3095] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow transition-all"
        >
          + Novo lead
        </button>
      </div>

      {errorMsg && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50/40 text-red-800 text-xs flex gap-2 items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </Card>
      )}

      {/* Caixa de alerta padrão Suns Brasil */}
      <div className="bg-[#EBF0F6] border border-blue-100 rounded-xl p-4 text-xs text-slate-700 font-medium">
        Nesta área, você pode gerenciar e acompanhar seus clientes. Para buscar clientes específicos, utilize a área de "Filtros".
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-xs font-bold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          <Filter className="w-3.5 h-3.5" /> Filtros
        </button>

        {showFilters && (
          <Card className="p-4 border border-slate-200/80 bg-white grid md:grid-cols-2 gap-4 animate-fade-up">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Buscar por palavra-chave</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Nome, telefone, cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-xs"
                />
              </div>
            </div>
            {corretores.length > 0 && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parceiro Atribuído</label>
                <select
                  value={filterCorretor}
                  onChange={(e) => setFilterCorretor(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-lg outline-none"
                >
                  <option value="todos">Todos os parceiros</option>
                  {corretores.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* CRM Board Columns (Suns Brasil Style) */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-navy" />
          <span className="text-sm font-semibold">Carregando quadro de leads...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((col) => {
            const colLeads = filteredClientes.filter((c) => col.statuses.includes(c.status));
            return (
              <div key={col.key} className="space-y-3 min-w-[220px]">
                {/* Header da coluna */}
                <div className="bg-[#EBF0F6] border border-blue-50/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold text-navy shadow-sm">
                  <span>{col.label}</span>
                  <span className="bg-[#2E44B8]/10 text-[#2E44B8] text-[10px] font-black px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>

                {/* Container dos leads */}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {colLeads.map((c) => (
                    <div 
                      key={c.id} 
                      className="bg-white border border-slate-200/80 rounded-xl p-3.5 hover:shadow-md transition-all duration-200 space-y-1.5"
                    >
                      <div className="font-extrabold text-navy text-xs leading-tight">{c.nome}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{c.telefone || "Sem telefone"}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{c.cidade || "—"}/{c.estado || "—"}</div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
                        <Link to="/app/cliente/$id" params={{ id: c.id }} className="text-[10px] text-[#2E44B8] hover:underline font-bold">
                          Ver ficha
                        </Link>
                        {c.telefone && (
                          <a
                            href={`https://wa.me/${c.telefone.replace(/\D/g, "")}`}
                            target="_blank" rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <MessageCircle className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Botão de adicionar novo lead da coluna */}
                  <button
                    onClick={() => handleOpenModal(col.statuses[0])}
                    className="w-full flex items-center justify-center gap-1.5 py-3 border border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                  >
                    + Nova lead
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Lead (Fiel ao print) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <DialogTitle className="text-base font-extrabold text-navy">Cadastrar nova lead</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveLead} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Nome</label>
              <Input
                placeholder="Nome completo do cliente"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-10 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600">E-mail</label>
              <Input
                type="email"
                placeholder="E-mail de contato"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-600">Celular *(Obrigatório)</label>
              <Input
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="h-10 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Estado</label>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                >
                  <option value="">Selecione um estado</option>
                  {ufsList.map((x) => (
                    <option key={x.id} value={x.sigla}>{x.nome}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Cidade</label>
                <select
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg outline-none text-xs"
                  disabled={!uf}
                >
                  <option value="">Selecione uma cidade</option>
                  {cidadesList.map((x) => (
                    <option key={x.id} value={x.nome}>{x.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={savingLead}
                className="suns-btn-accent px-8 py-2.5 rounded-full font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                {savingLead ? "Salvando..." : "Salvar dados"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
