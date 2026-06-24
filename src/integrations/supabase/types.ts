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
    },
  },
} as const
