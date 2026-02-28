-- profiles: gerado automaticamente via trigger após auth.users
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome text,
  avatar_url text,
  plano text DEFAULT 'free', -- 'free' | 'pro'
  created_at timestamptz DEFAULT now()
);

-- programas_saldos: saldo de milhas por programa
CREATE TABLE programas_saldos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_programa text NOT NULL,
  saldo_atual numeric DEFAULT 0,
  custo_medio numeric DEFAULT 0, -- R$/mil (custo médio ponderado)
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, nome_programa)
);

-- cartoes: cartões de crédito do usuário
CREATE TABLE cartoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  dia_fechamento integer CHECK (dia_fechamento BETWEEN 1 AND 31),
  dia_vencimento integer CHECK (dia_vencimento BETWEEN 1 AND 31),
  limite numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- operacoes: histórico de compras, vendas e transferências
CREATE TABLE operacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  data date NOT NULL,
  tipo text CHECK (tipo IN ('COMPRA','VENDA','TRANSF')),
  programa text NOT NULL,
  quantidade numeric NOT NULL,
  valor_total numeric NOT NULL,
  cpm numeric,       -- calculado: (valor/qtd)*1000
  roi numeric,       -- calculado na venda
  status_recebimento text DEFAULT 'recebido' CHECK (status_recebimento IN ('pendente','recebido')),
  data_recebimento date,
  cartao_id uuid REFERENCES cartoes(id) ON DELETE SET NULL,
  observacao text,
  created_at timestamptz DEFAULT now()
);

-- faturas_parcelas: parcelas geradas por compra parcelada
CREATE TABLE faturas_parcelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  operacao_id uuid REFERENCES operacoes(id) ON DELETE CASCADE,
  cartao_id uuid REFERENCES cartoes(id) ON DELETE CASCADE,
  valor numeric NOT NULL,
  mes_referencia text NOT NULL, -- 'YYYY-MM'
  parc_num integer,
  total_parc integer,
  pago boolean DEFAULT false,
  data_pagamento date,
  created_at timestamptz DEFAULT now()
);

-- metas: metas mensais de resultado
CREATE TABLE metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mes text NOT NULL, -- 'YYYY-MM'
  meta_lucro numeric DEFAULT 0,
  meta_volume_milhas numeric DEFAULT 0,
  UNIQUE(user_id, mes)
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas_saldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE operacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own programas_saldos" ON programas_saldos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own programas_saldos" ON programas_saldos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own programas_saldos" ON programas_saldos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own programas_saldos" ON programas_saldos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cartoes" ON cartoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cartoes" ON cartoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cartoes" ON cartoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cartoes" ON cartoes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own operacoes" ON operacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own operacoes" ON operacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own operacoes" ON operacoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own operacoes" ON operacoes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own faturas_parcelas" ON faturas_parcelas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own faturas_parcelas" ON faturas_parcelas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own faturas_parcelas" ON faturas_parcelas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own faturas_parcelas" ON faturas_parcelas FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own metas" ON metas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metas" ON metas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metas" ON metas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own metas" ON metas FOR DELETE USING (auth.uid() = user_id);

-- Trigger de Profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, nome)
  VALUES (new.id, new.raw_user_meta_data->>'nome');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
