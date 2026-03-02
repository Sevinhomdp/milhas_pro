'use client'

import * as React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Database } from '@/src/types'
import { formatCurrency } from '@/src/lib/utils'
import { createAlertaConfig, updateAlertaConfig } from '@/app/actions/inteligencia'

type TabId = 'historico' | 'promocoes' | 'alertas' | 'oportunidades'
type AlertaTipo = 'promocao_transferencia' | 'preco_acima' | 'preco_abaixo' | 'fatura_vencimento'

interface AlertConfig {
  id: string
  type: AlertaTipo
  threshold_value: number | null
  notification_channel: string | null
  contact_value: string | null
  is_active: boolean
  last_triggered_at: string | null
}

export default function Inteligencia({
  db,
  toast,
  userEmail,
  alertasConfig = [],
}: {
  db: Database
  toast: (msg: string, type?: any) => void
  theme?: 'light' | 'dark'
  userEmail?: string
  alertasConfig?: AlertConfig[]
}) {
  const [tab, setTab] = React.useState<TabId>('historico')

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-black uppercase tracking-wider text-[#F5A623]">Central de Automações e Inteligência</h1>
      <div className="flex gap-2 flex-wrap">
        {['historico', 'promocoes', 'alertas', 'oportunidades'].map((item) => (
          <button key={item} onClick={() => setTab(item as TabId)} className={`px-4 py-2 rounded-lg uppercase text-xs font-bold ${tab === item ? 'bg-[#F5A623] text-black' : 'bg-zinc-800'}`}>{item}</button>
        ))}
      </div>

      {tab === 'historico' && <HistoricoTab db={db} />}
      {tab === 'promocoes' && <RadarTab db={db} />}
      {tab === 'alertas' && <AlertasTab toast={toast} userEmail={userEmail} initialAlertas={alertasConfig} />}
      {tab === 'oportunidades' && <OportunidadesTab db={db} />}
    </div>
  )
}

function HistoricoTab({ db }: { db: Database }) {
  const [programa, setPrograma] = React.useState('SMILES')
  const [periodo, setPeriodo] = React.useState(30)
  const minDate = new Date(Date.now() - periodo * 24 * 60 * 60 * 1000)
  const rows = (db.market_prices || []).filter((p: any) => p.programa === programa && new Date(p.timestamp) >= minDate)
  const chartData = rows.map((item: any) => ({ date: new Date(item.timestamp).toLocaleDateString('pt-BR'), valor: Number(item.valor) }))
  const byPlatform = Object.values(rows.reduce((acc: any, row: any) => {
    if (!acc[row.plataforma] || new Date(acc[row.plataforma].timestamp) < new Date(row.timestamp)) acc[row.plataforma] = row
    return acc
  }, {} as Record<string, any>)) as any[]

  return <div className="space-y-4">
    <div className="flex gap-2 flex-wrap">
      {['SMILES', 'TUDOAZUL', 'MULTIPLUS', 'MILES&GO'].map((p) => <button key={p} className={`px-3 py-1 rounded ${programa === p ? 'bg-[#F5A623] text-black' : 'bg-zinc-800'}`} onClick={() => setPrograma(p)}>{p}</button>)}
      {[7, 30, 90].map((d) => <button key={d} className={`px-3 py-1 rounded ${periodo === d ? 'bg-[#F5A623] text-black' : 'bg-zinc-800'}`} onClick={() => setPeriodo(d)}>{d}d</button>)}
    </div>
    <div className="h-72 bg-zinc-900 rounded-xl p-3">{chartData.length === 0 ? <div className="animate-pulse h-full bg-zinc-800 rounded" /> : <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="valor" stroke="#F5A623" strokeWidth={2} /></LineChart></ResponsiveContainer>}</div>
    <div className="grid gap-2">{byPlatform.map((row) => <div key={row.id} className="bg-zinc-900 p-3 rounded flex justify-between"><span>{row.plataforma}</span><span>R$ {Number(row.valor).toFixed(2)}</span></div>)}</div>
  </div>
}

function RadarTab({ db }: { db: Database }) {
  const [filtro, setFiltro] = React.useState('todos')
  const news = db.market_news || []
  const filtered = filtro === 'todos' ? news : news.filter((n: any) => n.type === filtro)
  const active = filtered.filter((n: any) => n.is_active)
  const expired = filtered.filter((n: any) => !n.is_active)

  const renderCard = (item: any, faded = false) => (
    <div key={item.id} className={`bg-zinc-900 rounded-xl p-4 ${faded ? 'opacity-50' : ''}`}>
      <div className="text-xs uppercase text-[#F5A623]">{item.type}{item.type === 'promocao_transferencia' && item.bonus_percentage ? ` • ${item.bonus_percentage}%` : ''}</div>
      <h3 className="font-bold">{item.title || item.titulo}</h3>
      <p className="text-sm text-zinc-300">{item.summary || item.resumo_ai}</p>
      <a className="text-[#F5A623] text-sm" href={item.source_url || item.link} target="_blank">Ver original</a>
    </div>
  )

  return <div className="space-y-4">
    <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className="bg-zinc-900 px-3 py-2 rounded"><option value="todos">Todos</option><option value="promocao_transferencia">Promoção Transferência</option><option value="promocao_compra">Promoção Compra</option><option value="noticia">Notícia</option><option value="alerta">Alerta</option></select>
    <h2 className="uppercase text-[#F5A623] font-bold">Ativas</h2>
    <div className="grid gap-3">{active.map((n: any) => renderCard(n))}</div>
    <h2 className="uppercase text-[#F5A623] font-bold">Expiradas</h2>
    <div className="grid gap-3">{expired.map((n: any) => renderCard(n, true))}</div>
  </div>
}

function AlertasTab({ toast, userEmail, initialAlertas }: { toast: (msg: string, type?: any) => void; userEmail?: string; initialAlertas: AlertConfig[] }) {
  const [alertas, setAlertas] = React.useState(initialAlertas)
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()
  const [form, setForm] = React.useState<{ type: AlertaTipo; threshold_value: string; contact_value: string }>({ type: 'promocao_transferencia', threshold_value: '', contact_value: userEmail || '' })

  const requiresThreshold = form.type === 'preco_acima' || form.type === 'preco_abaixo' || form.type === 'fatura_vencimento'

  const onSave = () => {
    startTransition(async () => {
      const payload = {
        type: form.type,
        threshold_value: requiresThreshold ? Number(form.threshold_value || 0) : null,
        notification_channel: 'email',
        contact_value: form.contact_value,
        is_active: true,
      }
      const result = await createAlertaConfig(payload)
      if (!result.success) {
        toast('Erro ao criar alerta', 'error')
        return
      }

      setAlertas((prev) => [{ id: crypto.randomUUID(), ...payload, last_triggered_at: null } as AlertConfig, ...prev])
      setOpen(false)
      toast('Alerta criado com sucesso', 'success')
    })
  }

  const toggleAlerta = (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await updateAlertaConfig(id, { is_active: !current })
      if (!result.success) {
        toast('Erro ao atualizar alerta', 'error')
        return
      }
      setAlertas((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !current } : a))
      toast('Status do alerta atualizado', 'success')
    })
  }

  return <div className="space-y-3">
    <div className="bg-zinc-900 rounded-xl p-6"><h3 className="uppercase font-black text-[#F5A623]">Central de Automações</h3><p className="text-zinc-300 text-sm">Configure alertas de preço, promoção e vencimento.</p></div>
    {alertas.map((a) => <div key={a.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-center"><div><p className="uppercase text-xs text-[#F5A623]">{a.type}</p><p className="text-sm text-zinc-300">Canal: {a.notification_channel || 'email'} {a.threshold_value !== null ? `• Valor: ${a.threshold_value}` : ''}</p></div><button onClick={() => toggleAlerta(a.id, a.is_active)} className={`px-3 py-1 rounded text-xs font-bold ${a.is_active ? 'bg-emerald-600' : 'bg-zinc-700'}`}>{a.is_active ? 'ON' : 'OFF'}</button></div>)}
    <button onClick={() => setOpen(true)} className="px-4 py-2 rounded bg-[#F5A623] text-black font-bold uppercase text-xs">+ Novo Alerta de Mercado</button>

    {open && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 w-full max-w-md space-y-3">
          <h4 className="uppercase text-[#F5A623] font-bold">Novo Alerta</h4>
          <select className="w-full bg-zinc-800 p-2 rounded" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as AlertaTipo }))}>
            <option value="promocao_transferencia">Promoção de Transferência</option>
            <option value="preco_acima">Preço acima de R$ X por milheiro</option>
            <option value="preco_abaixo">Preço abaixo de R$ X por milheiro</option>
            <option value="fatura_vencimento">Fatura vencendo em X dias</option>
          </select>
          {requiresThreshold && <input className="w-full bg-zinc-800 p-2 rounded" type="number" placeholder="Valor" value={form.threshold_value} onChange={(e) => setForm((prev) => ({ ...prev, threshold_value: e.target.value }))} />}
          <input className="w-full bg-zinc-800 p-2 rounded" type="email" placeholder="E-mail de destino" value={form.contact_value} onChange={(e) => setForm((prev) => ({ ...prev, contact_value: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded bg-zinc-700" onClick={() => setOpen(false)}>Cancelar</button>
            <button className="px-3 py-2 rounded bg-[#F5A623] text-black font-bold" disabled={isPending} onClick={onSave}>Salvar</button>
          </div>
        </div>
      </div>
    )}
  </div>
}

function OportunidadesTab({ db }: { db: Database }) {
  const marketMonitor = ['SMILES', 'AZUL', 'LATAM'].map((programa) => ({ programa, price: Number((db.market_prices || []).find((p: any) => p.programa === programa)?.valor || 0) }))
  const sell = (db.saldos || []).map((saldo: any) => {
    const prices = (db.market_prices || []).filter((p: any) => p.programa === saldo.nome_programa.toUpperCase())
    const best = prices.sort((a: any, b: any) => Number(b.valor) - Number(a.valor))[0]
    if (!best) return null
    const atual = Number(best.valor)
    const custo = Number(saldo.custo_medio || 0)
    const lucroPercentual = custo > 0 ? ((atual - custo) / custo) * 100 : 0
    return { ...saldo, atual, lucroPercentual, lucroValor: (Number(saldo.saldo_atual || 0) / 1000) * (atual - custo), comprador: best.plataforma }
  }).filter(Boolean).filter((o: any) => o.lucroPercentual > 10)

  return <div className="grid md:grid-cols-3 gap-4">
    <div className="md:col-span-2 space-y-3">{sell.length ? sell.map((o: any) => <div key={o.program_id} className="bg-zinc-900 rounded-xl p-4"><div className="text-green-400">💰 Oportunidade de Venda</div><div>{o.nome_programa} • saldo {o.saldo_atual}</div><div>Lucro {formatCurrency(o.lucroValor)} ({o.lucroPercentual.toFixed(1)}%) • {o.comprador}</div></div>) : <div className="bg-zinc-900 rounded-xl p-6">Nenhuma oportunidade no momento. Adicione saldo em Saldos.</div>}</div>
    <div className="bg-zinc-900 rounded-xl p-4"><h3 className="uppercase text-[#F5A623]">Market Monitor</h3>{marketMonitor.map((m) => <div key={m.programa} className="flex justify-between"><span>{m.programa}</span><span>R$ {m.price.toFixed(2)}</span></div>)}</div>
  </div>
}
