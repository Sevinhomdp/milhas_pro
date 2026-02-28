export type Profile = {
  id: string;
  user_id: string;
  nome: string | null;
  avatar_url: string | null;
  plano: 'free' | 'pro';
  created_at: string;
};

export type ProgramaSaldo = {
  id: string;
  user_id: string;
  nome_programa: string;
  saldo_atual: number;
  custo_medio: number;
  updated_at: string;
};

export type Cartao = {
  id: string;
  user_id: string;
  nome: string;
  dia_fechamento: number;
  dia_vencimento: number;
  limite: number;
  created_at: string;
};

export type Operacao = {
  id: string;
  user_id: string;
  data: string;
  tipo: 'COMPRA' | 'VENDA' | 'TRANSF';
  programa: string;
  quantidade: number;
  valor_total: number;
  cpm: number | null;
  roi: number | null;
  status_recebimento: 'pendente' | 'recebido';
  data_recebimento: string | null;
  cartao_id: string | null;
  observacao: string | null;
  created_at: string;
};

export type FaturaParcela = {
  id: string;
  user_id: string;
  operacao_id: string;
  cartao_id: string;
  valor: number;
  mes_referencia: string;
  parc_num: number;
  total_parc: number;
  pago: boolean;
  data_pagamento: string | null;
  created_at: string;
};

export type Meta = {
  id: string;
  user_id: string;
  mes: string;
  meta_lucro: number;
  meta_volume_milhas: number;
};
