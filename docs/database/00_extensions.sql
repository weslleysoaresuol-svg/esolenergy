-- ==============================================================================
-- 🔌 MÓDULO 00: EXTENSÕES POSTGRESQL OBRIGATÓRIAS
-- Ecossistema: Esol Energy | Banco: Supabase (PostgreSQL 15+)
-- Dependências: Nenhuma (deve ser executado PRIMEIRO)
-- ==============================================================================

-- ltree: Indexação hierárquica para árvore MMN (pathing de rede multinível)
CREATE EXTENSION IF NOT EXISTS ltree;

-- pgcrypto: Funções criptográficas para SHA-256 Hash Chain do Ledger Contábil
CREATE EXTENSION IF NOT EXISTS pgcrypto;
