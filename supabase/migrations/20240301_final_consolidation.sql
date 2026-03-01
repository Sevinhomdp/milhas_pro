-- 1. LIMPEZA E UNIFICAÇÃO
-- Mover dados de operacoes (antiga) para operations (nova) se necessário, 
-- mas aqui vamos garantir que as tabelas de destino existam com a estrutura correta.

-- 2. FUNÇÃO: Atualizar Saldo e CPM Automaticamente
CREATE OR REPLACE FUNCTION public.fn_update_balance_and_cpm()
RETURNS TRIGGER AS $$
DECLARE
    v_total_qty NUMERIC;
    v_total_invested NUMERIC;
    v_avg_cpm NUMERIC;
BEGIN
    -- Se for COMPRA ou VENDA
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
        
        -- Calcular Nova Quantidade (Saldo)
        -- Somamos compras e subtraímos vendas para o programa específico
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'compra' THEN quantity WHEN type = 'venda' THEN -quantity ELSE 0 END), 0)
        INTO v_total_qty
        FROM public.operations
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND program_id = COALESCE(NEW.program_id, OLD.program_id);

        -- Calcular CPM Médio (Apenas de Compras)
        -- Fórmula: Soma(Valor + Taxas) / Soma(Quantidade)
        SELECT 
            COALESCE(SUM(value + fees), 0),
            COALESCE(SUM(quantity), 0)
        INTO v_total_invested, v_total_qty
        FROM public.operations
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) 
          AND program_id = COALESCE(NEW.program_id, OLD.program_id)
          AND type = 'compra';

        IF v_total_qty > 0 THEN
            v_avg_cpm := (v_total_invested / v_total_qty) * 1000;
        ELSE
            v_avg_cpm := 0;
        END IF;

        -- Atualizar ou Inserir na tabela balances
        INSERT INTO public.balances (user_id, program_id, calculated_balance, custo_medio, updated_at)
        VALUES (COALESCE(NEW.user_id, OLD.user_id), COALESCE(NEW.program_id, OLD.program_id), v_total_qty, v_avg_cpm, now())
        ON CONFLICT (user_id, program_id) DO UPDATE SET 
            calculated_balance = EXCLUDED.calculated_balance,
            custo_medio = EXCLUDED.custo_medio,
            updated_at = now();
            
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER: Disparar após qualquer mudança em operations
DROP TRIGGER IF EXISTS tr_update_balance ON public.operations;
CREATE TRIGGER tr_update_balance
AFTER INSERT OR UPDATE OR DELETE ON public.operations
FOR EACH ROW EXECUTE FUNCTION public.fn_update_balance_and_cpm();

-- 4. RLS: Garantir isolamento total
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own operations" ON public.operations;
CREATE POLICY "Users can manage their own operations" ON public.operations
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own balances" ON public.balances;
CREATE POLICY "Users can manage their own balances" ON public.balances
FOR ALL USING (auth.uid() = user_id);

-- 5. LIMPAR TABELAS OBSOLETAS (Cuidado: Apenas se não houver dados vivos)
-- DROP TABLE IF EXISTS public.operacoes;
-- DROP TABLE IF EXISTS public.programas_saldos;
