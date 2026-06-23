import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/contrato/$id")({
  head: () => ({ meta: [{ title: "Contrato — ESOL Energy" }] }),
  component: ContratoDetalhePage,
});

function ContratoDetalhePage() {
  const { id } = Route.useParams();
  const [c, setC] = useState<any>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("contratos_parceria").select("*").eq("id", id).maybeSingle();
      setC(data);
      if (data?.assinatura_url) {
        const { data: signed } = await supabase.storage
          .from("parceiros")
          .createSignedUrl(data.assinatura_url, 3600);
        setSigUrl(signed?.signedUrl ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-muted-foreground">Carregando…</div>;
  if (!c) return <div className="text-muted-foreground">Contrato não encontrado.</div>;

  return (
    <div className="max-w-3xl space-y-5">
      <Link to="/app/contratos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.nome_completo}</h1>
        <p className="text-muted-foreground text-sm">
          CPF {c.cpf} · Versão {c.versao} · Assinado em {new Date(c.assinado_em).toLocaleString("pt-BR")}
          {c.ip_assinatura ? ` · IP ${c.ip_assinatura}` : ""}
        </p>
      </div>

      <Card className="p-6 border-0 shadow-md">
        <h2 className="font-semibold mb-3">Conteúdo do contrato</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-[500px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed font-mono">
          {c.conteudo}
        </div>
      </Card>

      <Card className="p-6 border-0 shadow-md">
        <h2 className="font-semibold mb-3">Assinatura</h2>
        {sigUrl ? (
          <img src={sigUrl} alt="Assinatura" className="border rounded bg-white max-h-48" />
        ) : (
          <p className="text-muted-foreground text-sm">Assinatura indisponível.</p>
        )}
      </Card>

      <Button onClick={() => window.print()} variant="outline">Imprimir / salvar PDF</Button>
    </div>
  );
}
