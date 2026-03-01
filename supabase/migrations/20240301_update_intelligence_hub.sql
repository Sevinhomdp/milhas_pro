-- MIGRACÃO: HUB DE INTELIGÊNCIA V2
-- Adicionando suporte para Hotmilhas, Maxmilhas, ASAPMilhas, MaisMilhas e BankMilhas em múltiplos prazos.

-- 1. Atualizar a tabela existente
ALTER TABLE public.historico_precos 
ADD COLUMN IF NOT EXISTS plataforma text, -- Hotmilhas, Maxmilhas, etc.
ADD COLUMN IF NOT EXISTS prazo_recebimento text, -- 1, 30, 60, 90, 150 dias
ADD COLUMN IF NOT EXISTS tendencia text DEFAULT 'STABLE'; -- UP, DOWN, STABLE

-- 2. Criar índices para performance de busca e gráficos
CREATE INDEX IF NOT EXISTS idx_historico_v2 
ON public.historico_precos (programa, plataforma, prazo_recebimento, created_at DESC);

-- 3. Inserir dados de exemplo (opcional para teste inicial)
-- INSERT INTO public.historico_precos (programa, plataforma, prazo_recebimento, valor_milheiro)
-- VALUES ('SMILES', 'HOTMILHAS', '90 dias', 17.50);
