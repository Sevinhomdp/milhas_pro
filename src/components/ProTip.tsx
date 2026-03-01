diff --git a/src/components/ProTip.tsx b/src/components/ProTip.tsx
index d8effe2e69bea2d6f83fa4838777d23dda1438b6..2932c3dc6d7a7d20c0def312034132ecedd52d7e 100644
--- a/src/components/ProTip.tsx
+++ b/src/components/ProTip.tsx
@@ -1,29 +1,28 @@
 'use client'
 
-import React, { useState, useCallback, useEffect } from 'react'
-import { ViewType } from '../types'
+import React, { useState } from 'react'
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
@@ -64,98 +63,105 @@ const TIPS: Record<string, { text: string; tag?: string }[]> = {
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
 
+
+const hashText = (text: string) => {
+    let hash = 0
+    for (let i = 0; i < text.length; i += 1) {
+        hash = (hash * 31 + text.charCodeAt(i)) | 0
+    }
+    return Math.abs(hash)
+}
+
 interface ProTipProps {
-    view: string // Using string to allow flexible view names
+    view: string
 }
 
 export default function ProTip({ view }: ProTipProps) {
     const tips = TIPS[view] || DEFAULT_TIPS
 
-    const [visible, setVisible] = useState(true)
-    const [currentTip, setCurrentTip] = useState(() =>
-        tips[Math.floor(Math.random() * tips.length)]
-    )
+    const [shuffleSeed, setShuffleSeed] = useState(0)
+    const [hiddenViews, setHiddenViews] = useState<Record<string, boolean>>({})
+
+    const tipIndex = hashText(`${view}:${shuffleSeed}`) % tips.length
+    const currentTip = tips[tipIndex]
+
+    const visible = !hiddenViews[view]
 
-    // Nova dica aleatória ao trocar de aba
-    useEffect(() => {
-        const t = TIPS[view] || DEFAULT_TIPS
-        setCurrentTip(t[Math.floor(Math.random() * t.length)])
-        setVisible(true)
-    }, [view])
+    const shuffle = () => {
+        setHiddenViews(prev => ({ ...prev, [view]: false }))
+        setShuffleSeed(prev => prev + 1)
+    }
 
-    const shuffle = useCallback(() => {
-        const t = TIPS[view] || DEFAULT_TIPS
-        const available = t.filter(tip => tip.text !== currentTip.text)
-        const next = available[Math.floor(Math.random() * available.length)] || t[0]
-        setCurrentTip(next)
-    }, [view, currentTip])
+    const hide = () => {
+        setHiddenViews(prev => ({ ...prev, [view]: true }))
+    }
 
     if (!visible) return null
 
     return (
         <AnimatePresence mode="wait">
             <motion.div
-                key={currentTip.text}
+                key={`${view}-${shuffleSeed}`}
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
-                        onClick={() => setVisible(false)}
+                        onClick={hide}
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
