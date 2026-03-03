'use client'

import * as React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Bell, Megaphone, BarChart3, Zap, PlusCircle } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { cn, formatCurrency } from '@/src/lib/utils'
import { createAlertaConfig, updateAlertaConfig } from '@/src/app/actions/inteligencia'

type TabId = 'historico' | 'promocoes' | 'alertas' | 'oportunidades'

interface InteligenciaProps {
  db: any
  toast: (msg: string, type?: any) => void
  theme?: 'light' | 'dark'
  userEmail?: string
  alertasConfig?: any[]
}

const PROGRAMAS = ['SMILES', 'TUDOAZUL', 'MULTIPLUS', 'MILES&GO']
const PERIODOS = [
  { id: '7d', days: 7 },
  { id: '30d', days: 30 },
  { id: '90d', days: 90 },
] as const

export default function Inteligencia({ db, toast, userEmail, alertasConfig }: InteligenciaProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>('historico')

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-auto">
        {[
          { id: 'historico', label: 'Histórico', icon: BarChart3 },
          { id: 'promocoes', label: 'Radar', icon: Megaphone },
          { id: 'alertas', label: 'Alertas', icon: Bell },
          { id: 'oportunidades', label: 'Oportunidades', icon: Zap },
        ].map((tab) => (
          <Button key={tab.id} variant={activeTab === tab.id ? 'primary' : 'secondary'} onClick={() => setActiveTab(tab.id as TabId)}>
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'historico' && <HistoricoTab marketPrices={db.market_prices || []} />}
      {activeTab === 'promocoes' && <RadarTab marketNews={db.market_news || []} />}
      {activeTab === 'alertas' && <AlertasTab toast={toast} userEmail={userEmail} alertasConfig={alertasConfig || db.alertas_config || db.user_alerts || []} />}
      {activeTab === 'oportunidades' && <OportunidadesTab saldos={db.saldos || []} marketPrices={db.market_prices || []} />}
    </div>
  )
}

function HistoricoTab({ marketPrices }: { marketPrices: any[] }) {
  const [programa, setPrograma] = React.useState('SMILES')
  const [periodo, setPeriodo] = React.useState<(typeof PERIODOS)[number]['id']>('30d')
  const days = PERIODOS.find((p) => p.id === periodo)?.days ?? 30
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

  const data = marketPrices
    .filter((item) => item.programa === programa && new Date(item.timestamp).getTime() >= cutoff)
    .map((item) => ({
      date: new Date(item.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      valor: Number(item.valor) || 0,
    }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PROGRAMAS.map((p) => (
          <Button key={p} size="sm" variant={programa === p ? 'primary' : 'secondary'} onClick={() => setPrograma(p)}>{p}</Button>
        ))}
      </div>
      <div className="flex gap-2">
        {PERIODOS.map((p) => (
          <Button key={p.id} size="sm" variant={periodo === p.id ? 'primary' : 'secondary'} onClick={() => setPeriodo(p.id)}>{p.id}</Button>
        ))}
      </div>
      <div className="h-72 rounded-xl border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="valor" stroke="#f59e0b" fill="#f59e0b33" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RadarTab({ marketNews }: { marketNews: any[] }) {
  const [tipo, setTipo] = React.useState<'todos' | 'promocao_transferencia' | 'promocao_compra' | 'noticia' | 'alerta'>('todos')
  const filtered = marketNews.filter((n) => tipo === 'todos' || n.type === tipo)
  const ativas = filtered.filter((n) => n.is_active ?? n.ativa)
  const expiradas = filtered.filter((n) => !(n.is_active ?? n.ativa))

  return (
    <div className="space-y-4">
      <select className="rounded border p-2" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
        <option value="todos">Todos</option>
        <option value="promocao_transferencia">Promoção transferência</option>
        <option value="promocao_compra">Promoção compra</option>
        <option value="noticia">Notícia</option>
        <option value="alerta">Alerta</option>
      </select>

      <SectionNews title="Ativas" items={ativas} />
      <SectionNews title="Expiradas" items={expiradas} />
    </div>
  )
}

function SectionNews({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2">
        {items.map((news) => (
          <div key={news.id} className="rounded-xl border p-3">
            <p className="font-medium">{news.title || news.titulo}</p>
            <p className="text-sm text-muted-foreground">{news.summary || news.resumo_ai || 'Sem resumo'}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nenhum item.</p>}
      </div>
    </div>
  )
}

function AlertasTab({ toast, userEmail, alertasConfig }: { toast: (m: string) => void; userEmail?: string; alertasConfig: any[] }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [tipo, setTipo] = React.useState('promocao_transferencia')
  const [threshold, setThreshold] = React.useState('')
  const [email, setEmail] = React.useState(userEmail || '')
  const [alerts, setAlerts] = React.useState<any[]>(alertasConfig)

  async function onCreate() {
    await createAlertaConfig({
      type: tipo,
      threshold_value: threshold ? Number(threshold) : null,
      notification_channel: 'email',
      contact_value: email,
    })
    toast('Alerta criado com sucesso')
    setIsModalOpen(false)
  }

  async function onToggle(alerta: any) {
    const nextActive = !(alerta.is_active ?? true)
    await updateAlertaConfig(alerta.id, { is_active: nextActive })
    setAlerts((prev) => prev.map((item) => (item.id === alerta.id ? { ...item, is_active: nextActive } : item)))
  }

  return (
    <div className="space-y-3">
      {alerts.map((alerta) => (
        <div key={alerta.id} className="flex items-center justify-between rounded-xl border p-3">
          <div>
            <p className="font-medium">{(alerta.type || alerta.tipo_alerta || '').replaceAll('_', ' ')}</p>
            <Badge className={cn(alerta.is_active ? 'bg-emerald-500' : 'bg-zinc-500')}>{alerta.is_active ? 'ON' : 'OFF'}</Badge>
          </div>
          <Button variant="secondary" onClick={() => onToggle(alerta)}>{alerta.is_active ? 'Desligar' : 'Ligar'}</Button>
        </div>
      ))}

      <button onClick={() => setIsModalOpen(true)} className="w-full rounded-xl border-2 border-dashed p-4 text-sm font-semibold">
        <PlusCircle className="mr-2 inline h-4 w-4" /> + Novo Alerta de Mercado
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-3 rounded-xl bg-background p-4 border">
            <h4 className="font-semibold">Novo alerta</h4>
            <select className="w-full rounded border p-2" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="promocao_transferencia">Promoção de transferência</option>
              <option value="preco_acima">Preço acima</option>
              <option value="preco_abaixo">Preço abaixo</option>
              <option value="fatura_vencimento">Fatura vencimento</option>
            </select>
            <input className="w-full rounded border p-2" placeholder="Threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            <input className="w-full rounded border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={onCreate}>Salvar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OportunidadesTab({ saldos, marketPrices }: { saldos: any[]; marketPrices: any[] }) {
  const opportunities = saldos.map((saldo) => {
    const latest = marketPrices.find((item) => item.programa === String(saldo.nome_programa || '').toUpperCase())
    const valor = Number(latest?.valor || 0)
    return { programa: saldo.nome_programa, saldo: Number(saldo.saldo_atual || 0), valor }
  })

  const monitor = opportunities.reduce((acc, item) => acc + item.valor, 0)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">Market Monitor</p>
        <p className="text-2xl font-bold">{formatCurrency(monitor || 0)}</p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {opportunities.map((op) => (
          <div key={op.programa} className="rounded-xl border p-3">
            <p className="font-medium">{op.programa}</p>
            <p className="text-sm">Saldo: {op.saldo}</p>
            <p className="text-sm">Preço: {formatCurrency(op.valor)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
