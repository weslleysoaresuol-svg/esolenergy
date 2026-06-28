-- Migration: adiciona dados bancarios e Pix ao perfil do parceiro
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pix_tipo TEXT,
  ADD COLUMN IF NOT EXISTS pix_chave TEXT,
  ADD COLUMN IF NOT EXISTS banco_nome TEXT,
  ADD COLUMN IF NOT EXISTS banco_agencia TEXT,
  ADD COLUMN IF NOT EXISTS banco_conta TEXT;
