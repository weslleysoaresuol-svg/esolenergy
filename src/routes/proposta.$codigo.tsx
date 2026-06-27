import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropostaView } from "@/components/PropostaView";
import { toast } from "sonner";

export const Route = createFileRoute("/proposta/$codigo")({
  head: () => ({ meta: [{ title: "Sua proposta de energia solar — ESOL Energy" }] }),
  component: PropostaPublica,
});

function PropostaPublica() {
  const { codigo } = useParams({ from: "/proposta/$codigo" });
  const [proposta, setProposta] = useState<any>(null);
  const [parceiro, setParceiro] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expirada, setExpirada] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase.rpc as any)("get_proposta_publica", { _codigo: codigo });
      const payload = data as any;
      if (!payload) { setLoading(false); return; }
      if (payload.expirada) { setExpirada(true); setLoading(false); return; }
      setProposta(payload.proposta);
      setParceiro(payload.parceiro);
      setCliente(payload.cliente);
      await (supabase.rpc as any)("proposta_registrar_evento", { _codigo: codigo, _tipo: "visualizada", _ua: navigator.userAgent.slice(0, 200) });
      setLoading(false);
    })();
  }, [codigo]);

  const handleAceitar = async () => {
    await supabase.rpc("proposta_registrar_evento", { _codigo: codigo, _tipo: "aceita", _ua: navigator.userAgent.slice(0, 200) });
    toast.success("🎉 Proposta aceita! Seu consultor entrará em contato.");
    setTimeout(() => window.location.reload(), 1500);
  };
  const handleRecusar = async () => {
    if (!confirm("Tem certeza que deseja recusar esta proposta?")) return;
    await supabase.rpc("proposta_registrar_evento", { _codigo: codigo, _tipo: "recusada", _ua: navigator.userAgent.slice(0, 200) });
    toast.info("Proposta recusada. Obrigado pelo retorno!");
    setTimeout(() => window.location.reload(), 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando proposta…</div>;
  if (expirada) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-navy mb-2">Esta proposta expirou</h1>
        <p className="text-muted-foreground">Entre em contato com seu consultor para receber uma nova proposta atualizada.</p>
      </div>
    </div>
  );
  if (!proposta) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="text-center"><h1 className="text-2xl font-bold text-navy">Proposta não encontrada</h1></div>
    </div>
  );

  const aceita = proposta.status === "aceita";
  const recusada = proposta.status === "recusada";

  return (
    <div className="bg-white">
      {(aceita || recusada) && (
        <div className={`p-4 text-center font-semibold ${aceita ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
          {aceita ? "✅ Esta proposta foi aceita. Seu consultor entrará em contato em breve!" : "Esta proposta foi recusada."}
        </div>
      )}
      <PropostaView proposta={proposta} parceiro={parceiro} cliente={cliente} publico={!aceita && !recusada} onAceitar={handleAceitar} onRecusar={handleRecusar} />
    </div>
  );
}
