-- Migration: Popular espelho de custos operacionais e lucro para propostas e cotações legadas (existentes)
-- Atualiza retroativamente todos os registros com base nos parâmetros comerciais e taxas de comissão individuais dos corretores.

DO $$
DECLARE
  p RECORD;
BEGIN
  -- Obtém a última linha de parâmetros comerciais configurada
  SELECT * INTO p FROM public.parametros_comerciais ORDER BY updated_at DESC LIMIT 1;
  
  IF p IS NOT NULL THEN
    -- 1. Atualizar colunas básicas de custos em propostas
    UPDATE public.propostas prop
    SET
      fornecedor = COALESCE(prop.fornecedor, 'Aldo Solar'),
      custo_equipamentos = ROUND(prop.preco_total * p.custo_equipamentos_pct, 2),
      custo_instalacao = ROUND(prop.preco_total * p.custo_instalacao_pct, 2),
      custo_frete = ROUND(prop.preco_total * p.custo_frete_pct, 2),
      custo_impostos_compra = ROUND(prop.preco_total * COALESCE(p.custo_impostos_compra_pct, p.custo_impostos_pct, 0.03), 2),
      custo_comissao = ROUND(prop.preco_total * (COALESCE(prof.comissao_percent, p.custo_comissao_pct * 100) / 100.0), 2),
      custo_tributacao_empresa = ROUND(prop.preco_total * COALESCE(p.tributacao_empresa_pct, 0.10), 2),
      custo_marketing = ROUND(prop.preco_total * COALESCE(p.custo_marketing_pct, 0.03), 2),
      custo_engenharia_fixo = COALESCE(p.custo_engenharia_fixo_brl, 900),
      custo_overhead = ROUND(prop.preco_total * COALESCE(p.custo_overhead_pct, 0.05), 2),
      custo_garantia = ROUND(prop.preco_total * COALESCE(p.custo_garantia_pct, 0.008), 2)
    FROM public.profiles prof
    WHERE prop.parceiro_id = prof.id;

    -- 2. Atualizar somas operacionais e margem bruta das propostas
    UPDATE public.propostas
    SET
      custos_operacionais_totais = ROUND(custo_tributacao_empresa + custo_marketing + custo_engenharia_fixo + custo_overhead + custo_garantia, 2),
      margem_bruta = ROUND(preco_total - (custo_equipamentos + custo_instalacao + custo_frete + custo_impostos_compra + custo_comissao), 2)
    WHERE custo_equipamentos IS NOT NULL;

    -- 3. Atualizar lucro líquido real final das propostas
    UPDATE public.propostas
    SET
      lucro_liquido_real = ROUND(margem_bruta - custos_operacionais_totais, 2),
      lucro_liquido_pct = CASE WHEN preco_total > 0 THEN ROUND((margem_bruta - custos_operacionais_totais) / preco_total, 4) ELSE 0 END
    WHERE margem_bruta IS NOT NULL;

    -- 4. Atualizar colunas básicas de custos em cotações
    UPDATE public.cotacoes cot
    SET
      fornecedor = COALESCE(cot.fornecedor, 'Aldo Solar'),
      custo_equipamentos = ROUND(cot.preco_total * p.custo_equipamentos_pct, 2),
      custo_instalacao = ROUND(cot.preco_total * p.custo_instalacao_pct, 2),
      custo_frete = ROUND(cot.preco_total * p.custo_frete_pct, 2),
      custo_impostos_compra = ROUND(cot.preco_total * COALESCE(p.custo_impostos_compra_pct, p.custo_impostos_pct, 0.03), 2),
      custo_comissao = ROUND(cot.preco_total * (COALESCE(prof.comissao_percent, p.custo_comissao_pct * 100) / 100.0), 2),
      custo_tributacao_empresa = ROUND(cot.preco_total * COALESCE(p.tributacao_empresa_pct, 0.10), 2),
      custo_marketing = ROUND(cot.preco_total * COALESCE(p.custo_marketing_pct, 0.03), 2),
      custo_engenharia_fixo = COALESCE(p.custo_engenharia_fixo_brl, 900),
      custo_overhead = ROUND(cot.preco_total * COALESCE(p.custo_overhead_pct, 0.05), 2),
      custo_garantia = ROUND(cot.preco_total * COALESCE(p.custo_garantia_pct, 0.008), 2)
    FROM public.profiles prof
    WHERE cot.parceiro_id = prof.id;

    -- 5. Atualizar somas operacionais e margem bruta das cotações
    UPDATE public.cotacoes
    SET
      custos_operacionais_totais = ROUND(custo_tributacao_empresa + custo_marketing + custo_engenharia_fixo + custo_overhead + custo_garantia, 2),
      margem_bruta = ROUND(preco_total - (custo_equipamentos + custo_instalacao + custo_frete + custo_impostos_compra + custo_comissao), 2)
    WHERE custo_equipamentos IS NOT NULL;

    -- 6. Atualizar lucro líquido real final das cotações
    UPDATE public.cotacoes
    SET
      lucro_liquido_real = ROUND(margem_bruta - custos_operacionais_totais, 2),
      lucro_liquido_pct = CASE WHEN preco_total > 0 THEN ROUND((margem_bruta - custos_operacionais_totais) / preco_total, 4) ELSE 0 END
    WHERE margem_bruta IS NOT NULL;
    
  END IF;
END $$;
