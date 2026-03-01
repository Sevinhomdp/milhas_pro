'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { ViewType } from '../types'
import { Zap, X, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// ── Repositório de dicas (mínimo 5 por aba) ──────────────────
const TIPS: Record<string, { text: string; tag?: string }[]> = {
    dashboard: [
        { text: 'O ROI médio exibe a média ponderada das vendas realizadas. Meta saudável: acima de 20% por operação.', tag: 'ROI' },
        { text: 'Faturas vencendo em menos de 5 dias aparecem em vermelho no Dashboard. Antecipe o pagamento.', tag: 'Fluxo' },
        { text: 'CPM médio abaixo de R$18/mil? Você está comprando bem — tente travar esse preço em contratos recorrentes.', tag: 'CPM' },
        { text: 'O lucro "a receber" só vira caixa quando a venda for marcada como recebida. Monitore os prazos.', tag: 'Caixa' },
        { text: 'Use o Simulador antes de fechar qualquer negociação acima de R$5.000 para validar o ROI projetado.', tag: 'Pro' },
        { text: 'Gráfico de evolução plano? Diversifique programas — correlação baixa entre programas reduz risco operacional.', tag: 'Estratégia' },
    ],
    saldos: [
        { text: 'Use Ajuste Manual quando a divergência com o app da companhia for maior que 5% do saldo.', tag: 'Conciliação' },
        { text: 'Custo Médio Ponderado: quanto maior o estoque antigo com CPM baixo, menor fica o seu CMP geral.', tag: 'CMP' },
        { text: 'Milhas de diferentes programas têm liquidez diferente. Smiles e Livelo tendem a ter mais compradores.', tag: 'Liquidez' },
        { text: 'Estoque parado por mais de 60 dias aumenta o risco operacional. Priorize girar antes de comprar mais.', tag: 'Risco' },
        { text: 'Borda azul = saldo calculado pelas operações. Borda dourada = ajuste manual ativo.', tag: 'UI' },
    ],
    operacoes: [
        { text: 'CPM abaixo de R$18/mil é a zona verde. Entre R$18–R$25 é aceitável. Acima de R$25, negocie ou recuse.', tag: 'CPM' },
        { text: 'Compra parcelada? As parcelas aparecem automaticamente na Projeção de Caixa com os meses de vencimento.', tag: 'Parcelas' },
        { text: 'Transferências bonificadas reduzem seu CPM efetivo. Um bônus de 100% divide o custo por dois.', tag: 'Bônus' },
        { text: 'Exporte para CSV regularmente e guarde em planilha pessoal — é seu backup histórico fora do sistema.', tag: 'Backup' },
        { text: 'Registre sempre "Pendente" para vendas a prazo. O Dashboard separa lucro realizado de a receber.', tag: 'Status' },
        { text: 'Selecione múltiplas operações e use o recebimento em massa para atualizar o caixa com um clique.', tag: 'Pro' },
    ],
    dre: [
        { text: 'Margem abaixo de 15%? Revise os preços de compra ou negocie CPVs mais altos nas próximas vendas.', tag: 'Margem' },
        { text: 'Taxas de clubes e transferências constam em "Taxas e Clubes". Monitore se corroem a margem.', tag: 'Taxas' },
        { text: 'Compare o CPM médio do DRE com a sua meta de CPM para saber se está na direção certa.', tag: 'Metas' },
        { text: 'CPV acima de R$28/mil num mês ruim de demanda indica boa gestão de pricing.', tag: 'CPV' },
        { text: 'Meses com muitas compras e poucas vendas terão lucro negativo no DRE — normal ao montar estoque.', tag: 'Estoque' },
    ],
    projecao: [
        { text: 'Mantenha o equivalente ao total de parcelas do mês seguinte em CDB de liquidez diária.', tag: 'Caixa' },
        { text: 'Status vermelho (>R$10k) não é necessariamente ruim — pode refletir compras alavancadas com ROI alto.', tag: 'Alavancagem' },
        { text: 'A projeção mostra apenas parcelas de cartão. Vendas a receber aparecem no Dashboard.', tag: 'Info' },
        { text: 'Cartões com vencimento no início do mês exigem planejamento anterior. Reserve o capital com antecedência.', tag: 'Planejamento' },
        { text: 'Negocie o dia de vencimento dos cartões para alinhar com o recebimento típico das suas vendas.', tag: 'Pro' },
    ],
    simulador: [
        { text: 'Simule antes de negociar. O CPM máximo para ROI 20% é o seu preço limite absoluto de compra.', tag: 'Negociação' },
        { text: 'Sempre inclua taxas de clube no custo total. Elas podem transformar um ROI de 25% em 18%.', tag: 'Taxas' },
        { text: 'O saldo bonificável + bônus % é o "multiplicador" da operação. Um bônus de 100% dobra as milhas.', tag: 'Bônus' },
        { text: 'ROI acima de 50%? Documente o contexto — promoções raras que você pode tentar replicar.', tag: 'Pro' },
        { text: 'Calcule o "saldo seco" separadamente para entender qual parte da margem vem da promoção.', tag: 'Análise' },
    ],
    cartoes: [
        { text: 'Cartões com fechamento próximo ao fim do mês (dia 25+) dão mais prazo antes do vencimento.', tag: 'Prazo' },
        { text: 'Monitore a utilização do limite para não bloquear novas operações em janelas de promoção.', tag: 'Limite' },
        { text: 'Cadastre todos os cartões mesmo sem usá-los para milhas — para ter a projeção de caixa completa.', tag: 'Projeção' },
        { text: 'Negocie aumento de limite em períodos de alta operação. Comprove renda e histórico positivo.', tag: 'Pro' },
        { text: 'Cartões com recompensas em milhas diretas amplificam o retorno das compras de milhas.', tag: 'Recompensa' },
    ],
    metas: [
        { text: 'Defina a meta de CPM máximo antes do mês começar — isso disciplina as negociações de compra.', tag: 'Disciplina' },
        { text: 'Meta de margem de 20% ao mês é excelente para a maioria. Acima de 30% ao mês é nível elite.', tag: 'Benchmark' },
        { text: 'Metas de volume ajudam a escalar: dobrar o volume mantendo margem = dobrar o lucro absoluto.', tag: 'Escala' },
        { text: 'Sazonalidade (Black Friday, bônus de transferência) afeta o CPM disponível. Revise metas mensalmente.', tag: 'Sazonalidade' },
        { text: 'Compartilhe metas com um parceiro — accountability externo aumenta o cumprimento em ~40%.', tag: 'Pro' },
    ],
    mercado: [
        { text: 'Promoções relâmpago de bônus de transferência duram 24–72h. Configure alertas para não perder.', tag: 'Alerta' },
        { text: 'Histórico de CPM mostra sazonalidade — meses com mais compradores tendem a ter CPMs mais altos.', tag: 'Análise' },
        { text: 'CPM abaixo da sua meta ativa? Compre o máximo que seu caixa e limite permitirem.', tag: 'Oportunidade' },
        { text: 'Siga MaxMilhas, Passageiro de Primeira e Melhores Destinos para radar de promoções.', tag: 'Fontes' },
        { text: 'Alarmes de fatura vencendo com 7 dias de antecedência dão tempo para captar recursos.', tag: 'Segurança' },
    ],
    configuracoes: [
        { text: 'Mantenha o e-mail cadastrado atualizado — é o único canal de recuperação de acesso.', tag: 'Segurança' },
        { text: 'Ative notificações para receber alertas de faturas vencendo mesmo fora do sistema.', tag: 'Alertas' },
        { text: 'Login com Google sincroniza nome e foto automaticamente — sem configuração extra.', tag: 'Google' },
        { text: 'Exclua a conta somente após exportar todos os dados em CSV. A exclusão é irreversível.', tag: 'Aviso' },
        { text: 'Moeda preferencial afeta apenas exibição. Todas as operações são armazenadas em BRL.', tag: 'Info' },
    ],
}

const DEFAULT_TIPS = [
    { text: 'Use o Simulador para calcular ROI antes de fechar qualquer negociação.', tag: 'Pro' },
    { text: 'Exporte seus dados em CSV regularmente para manter um backup pessoal.', tag: 'Backup' },
]

interface ProTipProps {
    view: string // Using string to allow flexible view names
}

export default function ProTip({ view }: ProTipProps) {
    const tips = TIPS[view] || DEFAULT_TIPS

    const [visible, setVisible] = useState(true)
    const [currentTip, setCurrentTip] = useState(() =>
        tips[Math.floor(Math.random() * tips.length)]
    )

    // Nova dica aleatória ao trocar de aba
    useEffect(() => {
        const t = TIPS[view] || DEFAULT_TIPS
        setCurrentTip(t[Math.floor(Math.random() * t.length)])
        setVisible(true)
    }, [view])

    const shuffle = useCallback(() => {
        const t = TIPS[view] || DEFAULT_TIPS
        const available = t.filter(tip => tip.text !== currentTip.text)
        const next = available[Math.floor(Math.random() * available.length)] || t[0]
        setCurrentTip(next)
    }, [view, currentTip])

    if (!visible) return null

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentTip.text}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/15 dark:bg-amber-500/5 dark:border-amber-500/10 rounded-2xl px-4 py-3 mb-6"
            >
                <div className="shrink-0 w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center">
                    <Zap size={13} className="text-amber-500" />
                </div>

                <div className="flex-1 min-w-0">
                    {currentTip.tag && (
                        <span className="inline-block text-[9px] font-black text-amber-500 uppercase tracking-[0.1em] bg-amber-500/10 px-1.5 py-0.5 rounded-full mb-0.5">
                            {currentTip.tag}
                        </span>
                    )}
                    <p className="text-xs text-amber-700 dark:text-amber-300/80 font-medium leading-relaxed">
                        {currentTip.text}
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={shuffle}
                        title="Nova dica"
                        className="p-1.5 text-amber-500/50 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                    >
                        <RefreshCw size={11} />
                    </button>
                    <button
                        onClick={() => setVisible(false)}
                        title="Fechar"
                        className="p-1.5 text-amber-500/40 hover:text-amber-500/70 hover:bg-amber-500/10 rounded-lg transition-all"
                    >
                        <X size={11} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
