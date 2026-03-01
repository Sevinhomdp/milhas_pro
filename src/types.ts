export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: string;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  currency_name: string | null;
  user_id: string | null;
  created_at: string;
}

export interface Balance {
  id: string;
  user_id: string;
  program_id: string;
  calculated_balance: number;
  manual_adjustment: number;
  updated_at: string;
  program?: Program;
}

export interface Operation {
  id: string;
  user_id: string;
  type: 'compra' | 'venda' | 'transferencia';
  program_id: string;
  quantity: number;
  value: number;
  fees: number;
  cartao_id?: string | null;
  date: string;
  status: string;
  created_at: string;
  program?: Program;
}

export interface Cartao {
  id: string;
  user_id: string;
  nome: string;
  dia_fechamento: number;
  dia_vencimento: number;
  limite: number;
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

export interface MilePrice {
  id: string;
  program_id: string;
  cpm_buy: number | null;
  cpm_sell: number | null;
  source: string | null;
  captured_at: string;
  program?: Program;
}

export interface Meta {
  id: string;
  user_id: string;
  mes: string;
  meta_lucro: number;
  meta_volume_milhas: number;
  cpm_compra_alvo?: number;
  cpm_venda_alvo?: number;
  margem_desejada?: number;
  created_at: string;
}

export type ViewType =
  | 'dashboard'
  | 'saldos'
  | 'operacoes'
  | 'dre'
  | 'projecao'
  | 'simulador'
  | 'cartoes'
  | 'metas'
  | 'mercado'
  | 'configuracoes';

export interface ProgramaSaldo {
  program_id: string;
  nome_programa: string;
  saldo_atual: number;
  ajuste_manual: number | null;
  usar_ajuste_manual: boolean;
  custo_medio: number;
}


export interface Database {
  profile: Profile | null;
  programs: Program[];
  saldos: ProgramaSaldo[];
  operacoes: Operation[];
  faturas: FaturaParcela[];
  cartoes: Cartao[];
  metas: Meta[];
}


