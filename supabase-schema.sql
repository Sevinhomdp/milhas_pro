-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de cartões
CREATE TABLE IF NOT EXISTS public.cartoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    dia_fechamento INTEGER NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    limite NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de programas_saldos
CREATE TABLE IF NOT EXISTS public.programas_saldos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_programa TEXT NOT NULL,
    saldo_atual NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    custo_medio NUMERIC(10, 4) DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, nome_programa)
);

-- Criar tabela de operacoes
CREATE TABLE IF NOT EXISTS public.operacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('COMPRA', 'VENDA', 'TRANSF')),
    data DATE NOT NULL,
    programa TEXT NOT NULL,
    quantidade NUMERIC(15, 2) NOT NULL,
    valor_total NUMERIC(15, 2) NOT NULL,
    cpm NUMERIC(10, 4),
    roi NUMERIC(10, 2),
    cartao_id UUID REFERENCES public.cartoes(id) ON DELETE SET NULL,
    status_recebimento TEXT CHECK (status_recebimento IN ('pendente', 'recebido')),
    data_recebimento DATE,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de faturas_parcelas
CREATE TABLE IF NOT EXISTS public.faturas_parcelas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    operacao_id UUID NOT NULL REFERENCES public.operacoes(id) ON DELETE CASCADE,
    cartao_id UUID NOT NULL REFERENCES public.cartoes(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    mes_referencia TEXT NOT NULL, -- Formato: YYYY-MM
    parc_num INTEGER NOT NULL,
    total_parc INTEGER NOT NULL,
    pago BOOLEAN DEFAULT false NOT NULL,
    data_pagamento DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de metas
CREATE TABLE IF NOT EXISTS public.metas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mes TEXT NOT NULL, -- Formato: YYYY-MM
    meta_lucro NUMERIC(10, 2) NOT NULL,
    meta_volume_milhas NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, mes)
);

-- Configurar Row Level Security (RLS)
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas_saldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturas_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;

-- Políticas para cartoes
CREATE POLICY "Usuários podem ver seus próprios cartões" ON public.cartoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios cartões" ON public.cartoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios cartões" ON public.cartoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios cartões" ON public.cartoes FOR DELETE USING (auth.uid() = user_id);

-- Políticas para programas_saldos
CREATE POLICY "Usuários podem ver seus próprios saldos" ON public.programas_saldos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir seus próprios saldos" ON public.programas_saldos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seus próprios saldos" ON public.programas_saldos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar seus próprios saldos" ON public.programas_saldos FOR DELETE USING (auth.uid() = user_id);

-- Políticas para operacoes
CREATE POLICY "Usuários podem ver suas próprias operações" ON public.operacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias operações" ON public.operacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias operações" ON public.operacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias operações" ON public.operacoes FOR DELETE USING (auth.uid() = user_id);

-- Políticas para faturas_parcelas
CREATE POLICY "Usuários podem ver suas próprias faturas" ON public.faturas_parcelas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias faturas" ON public.faturas_parcelas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias faturas" ON public.faturas_parcelas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias faturas" ON public.faturas_parcelas FOR DELETE USING (auth.uid() = user_id);

-- Políticas para metas
CREATE POLICY "Usuários podem ver suas próprias metas" ON public.metas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem inserir suas próprias metas" ON public.metas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar suas próprias metas" ON public.metas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar suas próprias metas" ON public.metas FOR DELETE USING (auth.uid() = user_id);
