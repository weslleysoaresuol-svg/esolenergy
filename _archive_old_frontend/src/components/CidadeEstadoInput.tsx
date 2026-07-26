import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

interface CidadeEstadoInputProps {
  cidade: string;
  estado: string;
  onChange: (cidade: string, estado: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function CidadeEstadoInput({
  cidade,
  estado,
  onChange,
  placeholder = "Buscar cidade...",
  className = "",
  required = false,
}: CidadeEstadoInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [ibgeMunicipios, setIbgeMunicipios] = useState<{ nome: string; uf: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sincroniza o valor de exibição inicial quando cidade e estado mudam na tela pai
  useEffect(() => {
    if (cidade && estado) {
      setInputValue(`${cidade} - ${estado}`);
    } else if (cidade) {
      setInputValue(cidade);
    } else {
      setInputValue("");
    }
  }, [cidade, estado]);

  // Carrega a base de dados do IBGE
  useEffect(() => {
    const cached = typeof window !== "undefined" ? sessionStorage.getItem("ibge_municipios") : null;
    if (cached) {
      try {
        setIbgeMunicipios(JSON.parse(cached));
      } catch (e) {
        console.warn("Erro ao fazer parse dos municípios do IBGE do cache", e);
      }
    } else {
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const list = data
              .map((m: any) => ({
                nome: m.nome,
                uf: m.microrregiao?.mesorregiao?.UF?.sigla || m.regiao_imediata?.regiao_intermediaria?.UF?.sigla || "",
              }))
              .filter((x) => x.uf);
            setIbgeMunicipios(list);
            try {
              sessionStorage.setItem("ibge_municipios", JSON.stringify(list));
            } catch (e) {}
          }
        })
        .catch((err) => console.warn("Erro ao carregar lista de municipios IBGE", err));
    }
  }, []);

  // Filtra as sugestões baseado no que o usuário digitou
  const suggestions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    // Busca pelo nome da cidade antes do hífen
    const query = inputValue.split(" - ")[0].toLowerCase().trim();
    return ibgeMunicipios
      .filter((m) => m.nome.toLowerCase().includes(query))
      .slice(0, 5);
  }, [inputValue, ibgeMunicipios]);

  return (
    <div className="relative w-full">
      <Input
        required={required}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          setInputValue(val);
          setShowSuggestions(true);
          
          // Se o usuário apagar o input, limpa o estado na tela pai
          if (!val) {
            onChange("", "");
          } else {
            // Se o usuário digitar algo livremente, passa o valor digitado
            // O estado fica vazio até ele selecionar uma sugestão correta
            const parts = val.split(" - ");
            onChange(parts[0].trim(), parts[1] ? parts[1].trim() : "");
          }
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Pequeno timeout para permitir o clique nas sugestões antes de fechar a lista
          setTimeout(() => setShowSuggestions(false), 250);
        }}
        className={className}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-slate-100 text-slate-700">
          {suggestions.map((m, idx) => (
            <button
              key={`${m.nome}-${m.uf}-${idx}`}
              type="button"
              onClick={() => {
                setInputValue(`${m.nome} - ${m.uf}`);
                onChange(m.nome, m.uf);
                setShowSuggestions(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 font-semibold flex justify-between items-center transition-colors"
            >
              <span className="font-medium text-navy">{m.nome}</span>
              <span className="text-[9px] border border-slate-200 bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                {m.uf}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
