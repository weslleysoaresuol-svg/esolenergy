# Como contribuir (GitHub + IDEs externas)

## Setup

```bash
bun install
bun run dev      # vite preview em :8080
```

Variáveis (já presentes em `.env`):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`

## Fluxo

1. Branch a partir de `main`.
2. Mudança de UI/lógica → edite em `src/`. Tudo TanStack Start (rotas file-based em `src/routes/`).
3. Mudança de banco → crie migração SQL em `supabase/migrations/<ts>_<desc>.sql` (com GRANTs + RLS na mesma migração). Após push, a Lovable aplica e regenera `src/integrations/supabase/types.ts`.
4. PR → review → merge → sincroniza com Lovable automaticamente.

## Convenções de código

- TypeScript strict. Sem `any` exceto em casts de schema dessincronizado do Supabase.
- Componentes shadcn em `src/components/ui/` (não edite — use o gerador).
- Estilo: Tailwind v4 via `src/styles.css`. Tokens semânticos (`navy`, `sun`, `sun-deep`).
- Acesso ao banco: `import { supabase } from "@/integrations/supabase/client"` (client-side).
- Cliente admin (service role): `@/integrations/supabase/client.server` — só em server fns, nunca importar de rota/componente.

## RLS — regra de ouro

Toda tabela em `public` precisa de:
1. `CREATE TABLE`
2. `GRANT` (para `authenticated` no mínimo; `anon` só se houver policy `TO anon`)
3. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
4. `CREATE POLICY`

Sem isso, PostgREST retorna erro de permissão.

## Schema completo

Veja [`SCHEMA.md`](./SCHEMA.md).
