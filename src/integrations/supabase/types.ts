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
      parametros_comerciais: {
        Row: {
          area_por_modulo_m2: number
          capacidade_instaladores_kwp_mes: number
          created_at: string
          custo_comissao_pct: number
          custo_equipamentos_pct: number
          custo_frete_pct: number
          custo_impostos_pct: number
          custo_instalacao_pct: number
          hsp_centro_oeste: number
          hsp_nordeste: number
          hsp_norte: number
          hsp_sudeste: number
          hsp_sul: number
          id: string
          inflacao_energetica: number
          margem_alvo_pct: number
          perdas_sistema: number
          potencia_modulo_w: number
          preco_wp_comercial_grande: number
          preco_wp_comercial_pequeno: number
          preco_wp_industrial: number
          preco_wp_residencial_grande: number
          preco_wp_residencial_pequeno: number
          tarifa_kwh_default: number
          updated_at: string
          validade_proposta_dias: number
          vida_util_anos: number
        }
        Insert: {
          area_por_modulo_m2?: number
          capacidade_instaladores_kwp_mes?: number
          created_at?: string
          custo_comissao_pct?: number
          custo_equipamentos_pct?: number
          custo_frete_pct?: number
          custo_impostos_pct?: number
          custo_instalacao_pct?: number
          hsp_centro_oeste?: number
          hsp_nordeste?: number
          hsp_norte?: number
          hsp_sudeste?: number
          hsp_sul?: number
          id?: string
          inflacao_energetica?: number
          margem_alvo_pct?: number
          perdas_sistema?: number
          potencia_modulo_w?: number
          preco_wp_comercial_grande?: number
          preco_wp_comercial_pequeno?: number
          preco_wp_industrial?: number
          preco_wp_residencial_grande?: number
          preco_wp_residencial_pequeno?: number
          tarifa_kwh_default?: number
          updated_at?: string
          validade_proposta_dias?: number
          vida_util_anos?: number
        }
        Update: {
          area_por_modulo_m2?: number
          capacidade_instaladores_kwp_mes?: number
          created_at?: string
          custo_comissao_pct?: number
          custo_equipamentos_pct?: number
          custo_frete_pct?: number
          custo_impostos_pct?: number
          custo_instalacao_pct?: number
          hsp_centro_oeste?: number
          hsp_nordeste?: number
          hsp_norte?: number
          hsp_sudeste?: number
          hsp_sul?: number
          id?: string
          inflacao_energetica?: number
          margem_alvo_pct?: number
          perdas_sistema?: number
          potencia_modulo_w?: number
          preco_wp_comercial_grande?: number
          preco_wp_comercial_pequeno?: number
          preco_wp_industrial?: number
          preco_wp_residencial_grande?: number
          preco_wp_residencial_pequeno?: number
          tarifa_kwh_default?: number
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
          area_necessaria_m2: number
          arvores_equivalentes: number
          cidade: string | null
          co2_evitado_ton: number
          codigo_publico: string
          condicoes_pagamento: string | null
          consumo_kwh: number
          created_at: string
          economia_25_anos: number
          economia_anual: number
          economia_mensal: number
          editada_pelo_admin: boolean
          enviada_em: string | null
          estado: string | null
          expires_at: string
          geracao_mensal_kwh: number
          hsp: number
          id: string
          kwp_sistema: number
          observacoes: string | null
          parceiro_id: string
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
          titulo: string
          updated_at: string
          validade_dias: number
          visualizada_em: string | null
        }
        Insert: {
          aceita_em?: string | null
          area_necessaria_m2: number
          arvores_equivalentes?: number
          cidade?: string | null
          co2_evitado_ton?: number
          codigo_publico?: string
          condicoes_pagamento?: string | null
          consumo_kwh: number
          created_at?: string
          economia_25_anos: number
          economia_anual: number
          economia_mensal: number
          editada_pelo_admin?: boolean
          enviada_em?: string | null
          estado?: string | null
          expires_at?: string
          geracao_mensal_kwh: number
          hsp: number
          id?: string
          kwp_sistema: number
          observacoes?: string | null
          parceiro_id: string
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
          titulo: string
          updated_at?: string
          validade_dias?: number
          visualizada_em?: string | null
        }
        Update: {
          aceita_em?: string | null
          area_necessaria_m2?: number
          arvores_equivalentes?: number
          cidade?: string | null
          co2_evitado_ton?: number
          codigo_publico?: string
          condicoes_pagamento?: string | null
          consumo_kwh?: number
          created_at?: string
          economia_25_anos?: number
          economia_anual?: number
          economia_mensal?: number
          editada_pelo_admin?: boolean
          enviada_em?: string | null
          estado?: string | null
          expires_at?: string
          geracao_mensal_kwh?: number
          hsp?: number
          id?: string
          kwp_sistema?: number
          observacoes?: string | null
          parceiro_id?: string
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
          titulo?: string
          updated_at?: string
          validade_dias?: number
          visualizada_em?: string | null
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
      consume_invite: { Args: { _token: string }; Returns: boolean }
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
      imovel_tipo: "residencial" | "comercial" | "industrial" | "rural"
      proposta_status:
        | "rascunho"
        | "enviada"
        | "visualizada"
        | "aceita"
        | "recusada"
        | "expirada"
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
      imovel_tipo: ["residencial", "comercial", "industrial", "rural"],
      proposta_status: [
        "rascunho",
        "enviada",
        "visualizada",
        "aceita",
        "recusada",
        "expirada",
      ],
      tipo_instalacao: ["residencial", "comercial", "industrial", "rural"],
    },
  },
} as const
