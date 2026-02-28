export interface Cartao {
  id: string;
  user_id: string;
  nome: string;
  dia_fechamento: number;
  dia_vencimento: number;
  limite: number;
  created_at: string;
}

export interface ProgramaSaldo {
  id: string;
  user_id: string;
  nome_programa: string;
  saldo_atual: number;
  custo_medio: number;
  updated_at: string;
}

export interface Operacao {
  id: string;
  user_id: string;
  tipo: 'COMPRA' | 'VENDA' | 'TRANSF';
  data: string;
  programa: string;
  quantidade: number;
  valor_total: number;
  cpm: number | null;
  roi: number | null;
  cartao_id: string | null;
  status_recebimento: 'pendente' | 'recebido' | null;
  data_recebimento: string | null;
  observacao: string | null;
  created_at: string;
}

export interface FaturaParcela {
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
}

export interface Meta {
  id: string;
  user_id: string;
  mes: string;
  meta_lucro: number;
  meta_volume_milhas: number;
  created_at: string;
}
