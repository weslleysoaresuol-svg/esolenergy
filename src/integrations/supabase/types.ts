export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_approvals: {
        Row: {
          approved_by: string
          created_at: string
          id: string
          new_admin_id: string
        }
        Insert: {
          approved_by: string
          created_at?: string
          id?: string
          new_admin_id: string
        }
        Update: {
          approved_by?: string
          created_at?: string
          id?: string
          new_admin_id?: string
        }
        Relationships: []
      }
      banking_faturas: {
        Row: {
          id: string
          cliente_id: string | null
          contrato_id: string | null
          valor_fatura: number
          pagamento_liquidado: boolean
          liquidado_em: string | null
          gateway_tx_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          contrato_id?: string | null
          valor_fatura: number
          pagamento_liquidado?: boolean
          liquidado_em?: string | null
          gateway_tx_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          contrato_id?: string | null
          valor_fatura?: number
          pagamento_liquidado?: boolean
          liquidado_em?: string | null
          gateway_tx_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ledger_lancamentos: {
        Row: {
          id: string
          fatura_id: string | null
          valor: number
          tipo: string
          hash_sha256: string
          created_at: string
        }
        Insert: {
          id?: string
          fatura_id?: string | null
          valor: number
          tipo: string
          hash_sha256: string
          created_at?: string
        }
        Update: {
          id?: string
          fatura_id?: string | null
          valor?: number
          tipo?: string
          hash_sha256?: string
          created_at?: string
        }
        Relationships: []
      }
      overrides_batch_queue: {
        Row: {
          id: string
          node_path: string
          override_pct: number
          status: string
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          node_path: string
          override_pct: number
          status?: string
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          node_path?: string
          override_pct?: number
          status?: string
          created_at?: string
          processed_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          area_telhado: number | null
          cep: string | null
          cidade: string | null
          concessionaria: string | null
          consumo_kwh: number | null
          corretor_id: string | null
          cpf_cnpj: string | null
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          forma_pagamento: string | null
          id: string
          imovel_tipo: Database["public"]["Enums"]["imovel_tipo"] | null
          nome: string
          numero_uc: string | null
          observacoes: string | null
          origem: string | null
          payback_anos: number | null
          potencia_kwp: number | null
          status: Database["public"]["Enums"]["cliente_status"]
          telefone: string
          tipo_telhado: string | null
          updated_at: string
          valor_estimado: number | null
          valor_fatura: number | null
        }
        Insert: {
          area_telhado?: number | null
          cep?: string | null
          cidade?: string | null
          concessionaria?: string | null
          consumo_kwh?: number | null
          corretor_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          forma_pagamento?: string | null
          id?: string
          imovel_tipo?: Database["public"]["Enums"]["imovel_tipo"] | null
          nome: string
          numero_uc?: string | null
          observacoes?: string | null
          origem?: string | null
          payback_anos?: number | null
          potencia_kwp?: number | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone: string
          tipo_telhado?: string | null
          updated_at?: string
          valor_estimado?: number | null
          valor_fatura?: number | null
        }
        Update: {
          area_telhado?: number | null
          cep?: string | null
          cidade?: string | null
          concessionaria?: string | null
          consumo_kwh?: number | null
          corretor_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          forma_pagamento?: string | null
          id?: string
          imovel_tipo?: Database["public"]["Enums"]["imovel_tipo"] | null
          nome?: string
          numero_uc?: string | null
          observacoes?: string | null
          origem?: string | null
          payback_anos?: number | null
          potencia_kwp?: number | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string
          tipo_telhado?: string | null
          updated_at?: string
          valor_estimado?: number | null
          valor_fatura?: number | null
        }
        Relationships: []
      }
      contratos_parceria: {
        Row: {
          aceite_termos: boolean
          assinado_em: string
          assinatura_url: string | null
          conteudo: string
          cpf: string
          created_at: string
          id: string
          ip_assinatura: string | null
          nome_completo: string
          user_agent: string | null
          user_id: string
          versao: string
        }
        Insert: {
          aceite_termos?: boolean
          assinado_em?: string
          assinatura_url?: string | null
          conteudo: string
          cpf: string
          created_at?: string
          id?: string
          ip_assinatura?: string | null
          nome_completo: string
          user_agent?: string | null
          user_id: string
          versao: string
        }
        Update: {
          aceite_termos?: boolean
          assinado_em?: string
          assinatura_url?: string | null
          conteudo?: string
          cpf?: string
          created_at?: string
          id?: string
          ip_assinatura?: string | null
          nome_completo?: string
          user_agent?: string | null
          user_id?: string
          versao?: string
        }
        Relationships: []
      }
      cotacoes: {
        Row: {
          ajuste_fio_b_mensal: number | null
          cliente_id: string
          codigo_publico: string
          created_at: string
          custo_comissao: number | null
          custo_disponibilidade_mensal: number | null
          custo_engenharia_fixo: number | null
          custo_equipamentos: number | null
          custo_frete: number | null
          custo_garantia: number | null
          custo_impostos_compra: number | null
          custo_instalacao: number | null
          custo_marketing: number | null
          custo_overhead: number | null
          custo_tributacao_empresa: number | null
          custos_operacionais_totais: number | null
          economia_ajustada_25_anos: number | null
          economia_ajustada_anual: number | null
          economia_ajustada_mensal: number | null
          expires_at: string
          fornecedor: string | null
          id: string
          kit_id: string | null
          kit_snapshot: Json | null
          lucro_liquido_pct: number | null
          lucro_liquido_real: number | null
          margem_bruta: number | null
          observacoes: string | null
          parceiro_id: string
          payback_ajustado_meses: number | null
          pedido_id: string | null
          preco_total: number
          preco_unit: number
          proposta_id: string | null
          quantidade: number
          status: Database["public"]["Enums"]["cotacao_status"]
          tir_anual_pct: number | null
          updated_at: string
          vpl_brl: number | null
        }
        Insert: {
          ajuste_fio_b_mensal?: number | null
          cliente_id: string
          codigo_publico?: string
          created_at?: string
          custo_comissao?: number | null
          custo_disponibilidade_mensal?: number | null
          custo_engenharia_fixo?: number | null
          custo_equipamentos?: number | null
          custo_frete?: number | null
          custo_garantia?: number | null
          custo_impostos_compra?: number | null
          custo_instalacao?: number | null
          custo_marketing?: number | null
          custo_overhead?: number | null
          custo_tributacao_empresa?: number | null
          custos_operacionais_totais?: number | null
          economia_ajustada_25_anos?: number | null
          economia_ajustada_anual?: number | null
          economia_ajustada_mensal?: number | null
          expires_at?: string
          fornecedor?: string | null
          id?: string
          kit_id?: string | null
          kit_snapshot?: Json | null
          lucro_liquido_pct?: number | null
          lucro_liquido_real?: number | null
          margem_bruta?: number | null
          observacoes?: string | null
          parceiro_id: string
          payback_ajustado_meses?: number | null
          pedido_id?: string | null
          preco_total: number
          preco_unit: number
          proposta_id?: string | null
          quantidade?: number
          status?: Database["public"]["Enums"]["cotacao_status"]
          tir_anual_pct?: number | null
          updated_at?: string
          vpl_brl?: number | null
        }
        Update: {
          ajuste_fio_b_mensal?: number | null
          cliente_id?: string
          codigo_publico?: string
          created_at?: string
          custo_comissao?: number | null
          custo_disponibilidade_mensal?: number | null
          custo_engenharia_fixo?: number | null
          custo_equipamentos?: number | null
          custo_frete?: number | null
          custo_garantia?: number | null
          custo_impostos_compra?: number | null
          custo_instalacao?: number | null
          custo_marketing?: number | null
          custo_overhead?: number | null
          custo_tributacao_empresa?: number | null
          custos_operacionais_totais?: number | null
          economia_ajustada_25_anos?: number | null
          economia_ajustada_anual?: number | null
          economia_ajustada_mensal?: number | null
          expires_at?: string
          fornecedor?: string | null
          id?: string
          kit_id?: string | null
          kit_snapshot?: Json | null
          lucro_liquido_pct?: number | null
          lucro_liquido_real?: number | null
          margem_bruta?: number | null
          observacoes?: string | null
          parceiro_id?: string
          payback_ajustado_meses?: number | null
          pedido_id?: string | null
          preco_total?: number
          preco_unit?: number
          proposta_id?: string | null
          quantidade?: number
          status?: Database["public"]["Enums"]["cotacao_status"]
          tir_anual_pct?: number | null
          updated_at?: string
          vpl_brl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cotacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits_produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotacoes_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiras_solar: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          prazo_maximo_meses: number
          taxa_aprovacao_media: number
          taxa_cet_mes: number
          taxa_juros_mes: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          prazo_maximo_meses?: number
          taxa_aprovacao_media?: number
          taxa_cet_mes?: number
          taxa_juros_mes?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          prazo_maximo_meses?: number
          taxa_aprovacao_media?: number
          taxa_cet_mes?: number
          taxa_juros_mes?: number
        }
        Relationships: []
      }
      financiamento_eventos: {
        Row: {
          autor_id: string | null
          created_at: string
          financiamento_id: string
          id: string
          nota: string | null
          status_anterior:
            | Database["public"]["Enums"]["financiamento_status"]
            | null
          status_novo: Database["public"]["Enums"]["financiamento_status"]
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          financiamento_id: string
          id?: string
          nota?: string | null
          status_anterior?:
            | Database["public"]["Enums"]["financiamento_status"]
            | null
          status_novo: Database["public"]["Enums"]["financiamento_status"]
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          financiamento_id?: string
          id?: string
          nota?: string | null
          status_anterior?:
            | Database["public"]["Enums"]["financiamento_status"]
            | null
          status_novo?: Database["public"]["Enums"]["financiamento_status"]
        }
        Relationships: [
          {
            foreignKeyName: "financiamento_eventos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financiamento_eventos_financiamento_id_fkey"
            columns: ["financiamento_id"]
            isOneToOne: false
            referencedRelation: "financiamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      financiamentos: {
        Row: {
          banco: string | null
          carencia_dias: number | null
          cliente_id: string
          codigo_publico: string
          created_at: string
          decidido_em: string | null
          financeira: string | null
          id: string
          observacoes_cliente: string | null
          observacoes_internas: string | null
          parceiro_id: string
          parcela_mensal: number | null
          parcelas: number | null
          pedido_id: string | null
          proposta_id: string | null
          publicado: boolean
          status: Database["public"]["Enums"]["financiamento_status"]
          taxa_juros_am: number | null
          updated_at: string
          valor_aprovado: number | null
          valor_solicitado: number
        }
        Insert: {
          banco?: string | null
          carencia_dias?: number | null
          cliente_id: string
          codigo_publico?: string
          created_at?: string
          decidido_em?: string | null
          financeira?: string | null
          id?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          parceiro_id: string
          parcela_mensal?: number | null
          parcelas?: number | null
          pedido_id?: string | null
          proposta_id?: string | null
          publicado?: boolean
          status?: Database["public"]["Enums"]["financiamento_status"]
          taxa_juros_am?: number | null
          updated_at?: string
          valor_aprovado?: number | null
          valor_solicitado: number
        }
        Update: {
          banco?: string | null
          carencia_dias?: number | null
          cliente_id?: string
          codigo_publico?: string
          created_at?: string
          decidido_em?: string | null
          financeira?: string | null
          id?: string
          observacoes_cliente?: string | null
          observacoes_internas?: string | null
          parceiro_id?: string
          parcela_mensal?: number | null
          parcelas?: number | null
          pedido_id?: string | null
          proposta_id?: string | null
          publicado?: boolean
          status?: Database["public"]["Enums"]["financiamento_status"]
          taxa_juros_am?: number | null
          updated_at?: string
          valor_aprovado?: number | null
          valor_solicitado?: number
        }
        Relationships: [
          {
            foreignKeyName: "financiamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financiamentos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financiamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financiamentos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      interacoes: {
        Row: {
          autor_id: string | null
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          tipo: string
        }
        Insert: {
          autor_id?: string | null
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo: string
        }
        Update: {
          autor_id?: string | null
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      kits_produtos: {
        Row: {
          ativo: boolean
          codigo: string | null
          consumo_kwh_max: number | null
          consumo_kwh_min: number | null
          created_at: string
          destaque: boolean
          eficiencia_modulo: number | null
          fabricante_modulos: string | null
          faixa: string
          garantia_inversor_anos: number | null
          garantia_modulos_anos: number | null
          id: string
          imagem_url: string | null
          inversor: string | null
          nome: string
          potencia_kwp: number
          potencia_modulo_w: number
          preco: number
          quantidade_modulos: number
          tecnologia_modulo: string | null
          tipo_inversor: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          consumo_kwh_max?: number | null
          consumo_kwh_min?: number | null
          created_at?: string
          destaque?: boolean
          eficiencia_modulo?: number | null
          fabricante_modulos?: string | null
          faixa?: string
          garantia_inversor_anos?: number | null
          garantia_modulos_anos?: number | null
          id?: string
          imagem_url?: string | null
          inversor?: string | null
          nome: string
          potencia_kwp: number
          potencia_modulo_w?: number
          preco: number
          quantidade_modulos: number
          tecnologia_modulo?: string | null
          tipo_inversor?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          consumo_kwh_max?: number | null
          consumo_kwh_min?: number | null
          created_at?: string
          destaque?: boolean
          eficiencia_modulo?: number | null
          fabricante_modulos?: string | null
          faixa?: string
          garantia_inversor_anos?: number | null
          garantia_modulos_anos?: number | null
          id?: string
          imagem_url?: string | null
          inversor?: string | null
          nome?: string
          potencia_kwp?: number
          potencia_modulo_w?: number
          preco?: number
          quantidade_modulos?: number
          tecnologia_modulo?: string | null
          tipo_inversor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parametros_comerciais: {
        Row: {
          area_por_modulo_m2: number
          capacidade_instaladores_kwp_mes: number
          comissao_padrao_pct: number | null
          cosip_estimada_brl: number | null
          created_at: string
          custo_comissao_pct: number
          custo_disponibilidade_mono_brl: number | null
          custo_disponibilidade_tri_brl: number | null
          custo_engenharia_fixo_brl: number | null
          custo_equipamentos_pct: number
          custo_frete_minimo_brl: number | null
          custo_frete_pct: number
          custo_frete_por_100km_kwp: number | null
          custo_garantia_pct: number | null
          custo_impostos_compra_pct: number | null
          custo_impostos_pct: number
          custo_instalacao_pct: number
          custo_marketing_fixo_brl: number | null
          custo_marketing_pct: number | null
          custo_overhead_pct: number | null
          hsp_centro_oeste: number
          hsp_nordeste: number
          hsp_norte: number
          hsp_sudeste: number
          hsp_sul: number
          id: string
          inflacao_energetica: number
          inst_adicional_grande_kwp: number | null
          inst_ceramico_kwp: number | null
          inst_especial_kwp: number | null
          inst_laje_kwp: number | null
          inst_metalico_kwp: number | null
          inst_solo_kwp: number | null
          lucro_alvo_pct: number | null
          margem_alvo_pct: number
          percentual_fio_b: number | null
          perdas_sistema: number
          potencia_modulo_w: number
          preco_wp_comercial_grande: number
          preco_wp_comercial_pequeno: number
          preco_wp_industrial: number
          preco_wp_residencial_grande: number
          preco_wp_residencial_pequeno: number
          tarifa_kwh_default: number
          tributacao_empresa_pct: number | null
          updated_at: string
          validade_proposta_dias: number
          vida_util_anos: number
        }
        Insert: {
          area_por_modulo_m2?: number
          capacidade_instaladores_kwp_mes?: number
          comissao_padrao_pct?: number | null
          cosip_estimada_brl?: number | null
          created_at?: string
          custo_comissao_pct?: number
          custo_disponibilidade_mono_brl?: number | null
          custo_disponibilidade_tri_brl?: number | null
          custo_engenharia_fixo_brl?: number | null
          custo_equipamentos_pct?: number
          custo_frete_minimo_brl?: number | null
          custo_frete_pct?: number
          custo_frete_por_100km_kwp?: number | null
          custo_garantia_pct?: number | null
          custo_impostos_compra_pct?: number | null
          custo_impostos_pct?: number
          custo_instalacao_pct?: number
          custo_marketing_fixo_brl?: number | null
          custo_marketing_pct?: number | null
          custo_overhead_pct?: number | null
          hsp_centro_oeste?: number
          hsp_nordeste?: number
          hsp_norte?: number
          hsp_sudeste?: number
          hsp_sul?: number
          id?: string
          inflacao_energetica?: number
          inst_adicional_grande_kwp?: number | null
          inst_ceramico_kwp?: number | null
          inst_especial_kwp?: number | null
          inst_laje_kwp?: number | null
          inst_metalico_kwp?: number | null
          inst_solo_kwp?: number | null
          lucro_alvo_pct?: number | null
          margem_alvo_pct?: number
          percentual_fio_b?: number | null
          perdas_sistema?: number
          potencia_modulo_w?: number
          preco_wp_comercial_grande?: number
          preco_wp_comercial_pequeno?: number
          preco_wp_industrial?: number
          preco_wp_residencial_grande?: number
          preco_wp_residencial_pequeno?: number
          tarifa_kwh_default?: number
          tributacao_empresa_pct?: number | null
          updated_at?: string
          validade_proposta_dias?: number
          vida_util_anos?: number
        }
        Update: {
          area_por_modulo_m2?: number
          capacidade_instaladores_kwp_mes?: number
          comissao_padrao_pct?: number | null
          cosip_estimada_brl?: number | null
          created_at?: string
          custo_comissao_pct?: number
          custo_disponibilidade_mono_brl?: number | null
          custo_disponibilidade_tri_brl?: number | null
          custo_engenharia_fixo_brl?: number | null
          custo_equipamentos_pct?: number
          custo_frete_minimo_brl?: number | null
          custo_frete_pct?: number
          custo_frete_por_100km_kwp?: number | null
          custo_garantia_pct?: number | null
          custo_impostos_compra_pct?: number | null
          custo_impostos_pct?: number
          custo_instalacao_pct?: number
          custo_marketing_fixo_brl?: number | null
          custo_marketing_pct?: number | null
          custo_overhead_pct?: number | null
          hsp_centro_oeste?: number
          hsp_nordeste?: number
          hsp_norte?: number
          hsp_sudeste?: number
          hsp_sul?: number
          id?: string
          inflacao_energetica?: number
          inst_adicional_grande_kwp?: number | null
          inst_ceramico_kwp?: number | null
          inst_especial_kwp?: number | null
          inst_laje_kwp?: number | null
          inst_metalico_kwp?: number | null
          inst_solo_kwp?: number | null
          lucro_alvo_pct?: number | null
          margem_alvo_pct?: number
          percentual_fio_b?: number | null
          perdas_sistema?: number
          potencia_modulo_w?: number
          preco_wp_comercial_grande?: number
          preco_wp_comercial_pequeno?: number
          preco_wp_industrial?: number
          preco_wp_residencial_grande?: number
          preco_wp_residencial_pequeno?: number
          tarifa_kwh_default?: number
          tributacao_empresa_pct?: number | null
          updated_at?: string
          validade_proposta_dias?: number
          vida_util_anos?: number
        }
        Relationships: []
      }
      partner_invites: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          note: string | null
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          note?: string | null
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          note?: string | null
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_id: string
          created_at: string
          data_entrega_prevista: string | null
          data_instalacao_prevista: string | null
          descricao: string | null
          forma_pagamento: string | null
          id: string
          kit_snapshot: Json | null
          numero: string
          observacoes: string | null
          observacoes_cliente: string | null
          origem: Database["public"]["Enums"]["pedido_origem"]
          origem_id: string | null
          parceiro_id: string
          status: Database["public"]["Enums"]["pedido_status"]
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_entrega_prevista?: string | null
          data_instalacao_prevista?: string | null
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          kit_snapshot?: Json | null
          numero?: string
          observacoes?: string | null
          observacoes_cliente?: string | null
          origem?: Database["public"]["Enums"]["pedido_origem"]
          origem_id?: string | null
          parceiro_id: string
          status?: Database["public"]["Enums"]["pedido_status"]
          updated_at?: string
          valor_total: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_entrega_prevista?: string | null
          data_instalacao_prevista?: string | null
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          kit_snapshot?: Json | null
          numero?: string
          observacoes?: string | null
          observacoes_cliente?: string | null
          origem?: Database["public"]["Enums"]["pedido_origem"]
          origem_id?: string | null
          parceiro_id?: string
          status?: Database["public"]["Enums"]["pedido_status"]
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          comissao_percent: number | null
          contrato_assinado: boolean
          cpf_cnpj: string | null
          created_at: string
          creci: string | null
          email: string | null
          estado: string | null
          id: string
          nome: string | null
          onboarding_completo: boolean
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          comissao_percent?: number | null
          contrato_assinado?: boolean
          cpf_cnpj?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          estado?: string | null
          id: string
          nome?: string | null
          onboarding_completo?: boolean
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          comissao_percent?: number | null
          contrato_assinado?: boolean
          cpf_cnpj?: string | null
          created_at?: string
          creci?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          onboarding_completo?: boolean
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposta_clientes: {
        Row: {
          cliente_id: string
          created_at: string
          enviado_em: string | null
          enviado_email: boolean
          enviado_whatsapp: boolean
          id: string
          proposta_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          enviado_em?: string | null
          enviado_email?: boolean
          enviado_whatsapp?: boolean
          id?: string
          proposta_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          enviado_em?: string | null
          enviado_email?: boolean
          enviado_whatsapp?: boolean
          id?: string
          proposta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposta_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_clientes_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      proposta_eventos: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          payload: Json | null
          proposta_id: string
          tipo: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          proposta_id: string
          tipo: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          payload?: Json | null
          proposta_id?: string
          tipo?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposta_eventos_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          aceita_em: string | null
          ajuste_fio_b_mensal: number | null
          area_necessaria_m2: number
          arvores_equivalentes: number
          cidade: string | null
          co2_evitado_ton: number
          codigo_publico: string
          condicoes_pagamento: string | null
          consumo_kwh: number
          created_at: string
          custo_comissao: number | null
          custo_disponibilidade_mensal: number | null
          custo_engenharia_fixo: number | null
          custo_equipamentos: number | null
          custo_frete: number | null
          custo_garantia: number | null
          custo_impostos_compra: number | null
          custo_instalacao: number | null
          custo_marketing: number | null
          custo_overhead: number | null
          custo_tributacao_empresa: number | null
          custos_operacionais_totais: number | null
          distribuidora_id: string | null
          economia_25_anos: number
          economia_ajustada_25_anos: number | null
          economia_ajustada_anual: number | null
          economia_ajustada_mensal: number | null
          economia_anual: number
          economia_mensal: number
          editada_pelo_admin: boolean
          eh_admin_proposta: boolean | null
          enviada_em: string | null
          estado: string | null
          expires_at: string
          fornecedor: string | null
          geracao_mensal_kwh: number
          hsp: number
          id: string
          kwp_sistema: number
          lucro_liquido_pct: number | null
          lucro_liquido_real: number | null
          margem_bruta: number | null
          observacoes: string | null
          parceiro_id: string
          payback_ajustado_meses: number | null
          payback_meses: number
          potencia_inversor_kw: number | null
          potencia_modulo_w: number
          preco_por_wp: number
          preco_total: number
          qtd_inversores: number
          qtd_modulos: number
          recusada_em: string | null
          regiao: string | null
          status: Database["public"]["Enums"]["proposta_status"]
          tarifa_kwh: number
          tipo_instalacao: Database["public"]["Enums"]["tipo_instalacao"]
          tipo_telhado: string | null
          tir_anual_pct: number | null
          titulo: string
          updated_at: string
          validade_dias: number
          visualizada_em: string | null
          vpl_brl: number | null
        }
        Insert: {
          aceita_em?: string | null
          ajuste_fio_b_mensal?: number | null
          area_necessaria_m2: number
          arvores_equivalentes?: number
          cidade?: string | null
          co2_evitado_ton?: number
          codigo_publico?: string
          condicoes_pagamento?: string | null
          consumo_kwh: number
          created_at?: string
          custo_comissao?: number | null
          custo_disponibilidade_mensal?: number | null
          custo_engenharia_fixo?: number | null
          custo_equipamentos?: number | null
          custo_frete?: number | null
          custo_garantia?: number | null
          custo_impostos_compra?: number | null
          custo_instalacao?: number | null
          custo_marketing?: number | null
          custo_overhead?: number | null
          custo_tributacao_empresa?: number | null
          custos_operacionais_totais?: number | null
          distribuidora_id?: string | null
          economia_25_anos: number
          economia_ajustada_25_anos?: number | null
          economia_ajustada_anual?: number | null
          economia_ajustada_mensal?: number | null
          economia_anual: number
          economia_mensal: number
          editada_pelo_admin?: boolean
          eh_admin_proposta?: boolean | null
          enviada_em?: string | null
          estado?: string | null
          expires_at?: string
          fornecedor?: string | null
          geracao_mensal_kwh: number
          hsp: number
          id?: string
          kwp_sistema: number
          lucro_liquido_pct?: number | null
          lucro_liquido_real?: number | null
          margem_bruta?: number | null
          observacoes?: string | null
          parceiro_id: string
          payback_ajustado_meses?: number | null
          payback_meses: number
          potencia_inversor_kw?: number | null
          potencia_modulo_w: number
          preco_por_wp: number
          preco_total: number
          qtd_inversores?: number
          qtd_modulos: number
          recusada_em?: string | null
          regiao?: string | null
          status?: Database["public"]["Enums"]["proposta_status"]
          tarifa_kwh: number
          tipo_instalacao?: Database["public"]["Enums"]["tipo_instalacao"]
          tipo_telhado?: string | null
          tir_anual_pct?: number | null
          titulo: string
          updated_at?: string
          validade_dias?: number
          visualizada_em?: string | null
          vpl_brl?: number | null
        }
        Update: {
          aceita_em?: string | null
          ajuste_fio_b_mensal?: number | null
          area_necessaria_m2?: number
          arvores_equivalentes?: number
          cidade?: string | null
          co2_evitado_ton?: number
          codigo_publico?: string
          condicoes_pagamento?: string | null
          consumo_kwh?: number
          created_at?: string
          custo_comissao?: number | null
          custo_disponibilidade_mensal?: number | null
          custo_engenharia_fixo?: number | null
          custo_equipamentos?: number | null
          custo_frete?: number | null
          custo_garantia?: number | null
          custo_impostos_compra?: number | null
          custo_instalacao?: number | null
          custo_marketing?: number | null
          custo_overhead?: number | null
          custo_tributacao_empresa?: number | null
          custos_operacionais_totais?: number | null
          distribuidora_id?: string | null
          economia_25_anos?: number
          economia_ajustada_25_anos?: number | null
          economia_ajustada_anual?: number | null
          economia_ajustada_mensal?: number | null
          economia_anual?: number
          economia_mensal?: number
          editada_pelo_admin?: boolean
          eh_admin_proposta?: boolean | null
          enviada_em?: string | null
          estado?: string | null
          expires_at?: string
          fornecedor?: string | null
          geracao_mensal_kwh?: number
          hsp?: number
          id?: string
          kwp_sistema?: number
          lucro_liquido_pct?: number | null
          lucro_liquido_real?: number | null
          margem_bruta?: number | null
          observacoes?: string | null
          parceiro_id?: string
          payback_ajustado_meses?: number | null
          payback_meses?: number
          potencia_inversor_kw?: number | null
          potencia_modulo_w?: number
          preco_por_wp?: number
          preco_total?: number
          qtd_inversores?: number
          qtd_modulos?: number
          recusada_em?: string | null
          regiao?: string | null
          status?: Database["public"]["Enums"]["proposta_status"]
          tarifa_kwh?: number
          tipo_instalacao?: Database["public"]["Enums"]["tipo_instalacao"]
          tipo_telhado?: string | null
          tir_anual_pct?: number | null
          titulo?: string
          updated_at?: string
          validade_dias?: number
          visualizada_em?: string | null
          vpl_brl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_cliente: {
        Row: {
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          metadata: Json | null
          parceiro_id: string | null
          referencia_id: string | null
          tipo: Database["public"]["Enums"]["timeline_tipo"]
          titulo: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          metadata?: Json | null
          parceiro_id?: string | null
          referencia_id?: string | null
          tipo: Database["public"]["Enums"]["timeline_tipo"]
          titulo: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          metadata?: Json | null
          parceiro_id?: string | null
          referencia_id?: string | null
          tipo?: Database["public"]["Enums"]["timeline_tipo"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_cliente_parceiro_id_fkey"
            columns: ["parceiro_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirmar_liquidacao_pagamento: {
        Args: { p_fatura_id: string; p_gateway_tx_id?: string; p_valor_pago?: number }
        Returns: Json
      }
      consume_invite: { Args: { _token: string }; Returns: boolean }
      get_cotacao_publica: { Args: { _codigo: string }; Returns: Json }
      get_financiamento_publico: { Args: { _codigo: string }; Returns: Json }
      get_parametros_landing: { Args: never; Returns: Json }
      get_parametros_publicos: { Args: never; Returns: Json }
      get_proposta_publica: { Args: { _codigo: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      proposta_registrar_evento: {
        Args: { _codigo: string; _ip?: string; _tipo: string; _ua?: string }
        Returns: undefined
      }
      reconciliar_gateway_ledger: {
        Args: { p_dias_janela?: number }
        Returns: Json
      }
      reverter_comissoes_inadimplencia: {
        Args: { p_fatura_id: string; p_motivo?: string }
        Returns: Json
      }
      validate_invite: {
        Args: { _token: string }
        Returns: {
          expires_at: string
          reason: string
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "corretor"
      cliente_status:
        | "novo"
        | "contato"
        | "visita_agendada"
        | "proposta_enviada"
        | "negociacao"
        | "contrato_assinado"
        | "instalacao"
        | "concluido"
        | "perdido"
      cotacao_status:
        | "rascunho"
        | "enviada"
        | "convertida_proposta"
        | "convertida_pedido"
        | "cancelada"
      financiamento_status:
        | "aguardando_documentos"
        | "em_analise"
        | "pre_aprovado"
        | "aprovado"
        | "recusado"
        | "contrato_assinado"
        | "liberado"
        | "cancelado"
      imovel_tipo: "residencial" | "comercial" | "industrial" | "rural"
      pedido_origem: "cotacao" | "proposta" | "manual"
      pedido_status:
        | "novo"
        | "em_separacao"
        | "faturado"
        | "expedido"
        | "entregue"
        | "instalado"
        | "concluido"
        | "cancelado"
      proposta_status:
        | "rascunho"
        | "enviada"
        | "visualizada"
        | "aceita"
        | "recusada"
        | "expirada"
      timeline_tipo:
        | "cotacao"
        | "proposta"
        | "pedido"
        | "financiamento"
        | "interacao"
        | "contrato"
        | "observacao"
      tipo_instalacao: "residencial" | "comercial" | "industrial" | "rural"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "corretor"],
      cliente_status: [
        "novo",
        "contato",
        "visita_agendada",
        "proposta_enviada",
        "negociacao",
        "contrato_assinado",
        "instalacao",
        "concluido",
        "perdido",
      ],
      cotacao_status: [
        "rascunho",
        "enviada",
        "convertida_proposta",
        "convertida_pedido",
        "cancelada",
      ],
      financiamento_status: [
        "aguardando_documentos",
        "em_analise",
        "pre_aprovado",
        "aprovado",
        "recusado",
        "contrato_assinado",
        "liberado",
        "cancelado",
      ],
      imovel_tipo: ["residencial", "comercial", "industrial", "rural"],
      pedido_origem: ["cotacao", "proposta", "manual"],
      pedido_status: [
        "novo",
        "em_separacao",
        "faturado",
        "expedido",
        "entregue",
        "instalado",
        "concluido",
        "cancelado",
      ],
      proposta_status: [
        "rascunho",
        "enviada",
        "visualizada",
        "aceita",
        "recusada",
        "expirada",
      ],
      timeline_tipo: [
        "cotacao",
        "proposta",
        "pedido",
        "financiamento",
        "interacao",
        "contrato",
        "observacao",
      ],
      tipo_instalacao: ["residencial", "comercial", "industrial", "rural"],
    },
  },
} as const
