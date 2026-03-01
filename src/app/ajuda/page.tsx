'use client'

import * as React from 'react'
import { HelpCircle, Book, MessageSquare, Shield, ArrowLeft, ChevronDown, Search, ExternalLink } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { cn } from '@/src/lib/utils'

const FAQS = [
    {
        category: 'Começando',
        icon: Book,
        items: [
            { q: 'Como cadastrar meu primeiro cartão?', a: 'Vá na aba "Cartões" no menu lateral, clique em "Novo Cartão" e preencha o nome, dia de fechamento, vencimento e limite. Isso habilitará o simulador de acúmulo.' },
            { q: 'O que é o CPM?', a: 'Custo por Milheiro. É o valor que você pagou por cada 1.000 milhas. O cálculo é: (Valor Total + Taxas) / (Quantidade / 1000).' },
        ]
    },
    {
        category: 'Operações',
        icon: MessageSquare,
        items: [
            { q: 'Como registrar uma transferência bonificada?', a: 'No menu "Lançamentos", selecione a aba "Transferência". Informe o programa de origem (ex: Livelo), o destino (ex: Smiles) e o bônus da promoção. O sistema calculará automaticamente o saldo final no destino.' },
            { q: 'Vendi milhas, como marcar como recebido?', a: 'Na lista de lançamentos, localize a venda e clique no ícone de "Check" verde. Isso atualizará seu fluxo de caixa projetado no DRE.' },
        ]
    },
    {
        category: 'Segurança & Conta',
        icon: Shield,
        items: [
            { q: 'Meus dados estão seguros?', a: 'Sim. Utilizamos criptografia de ponta a ponta via Supabase Auth e o acesso ao banco de dados é protegido por Row Level Security (RLS), garantindo que apenas você veja seus dados.' },
            { q: 'Como alterar minha senha?', a: 'Acesse "Configurações" no rodapé do menu lateral. Lá você encontrará o campo para definir uma nova senha de acesso.' },
        ]
    }
]

export default function AjudaPage() {
    const [openItems, setOpenItems] = React.useState<string[]>([])
    const [search, setSearch] = React.useState('')

    const toggle = (q: string) => {
        setOpenItems(p => p.includes(q) ? p.filter(x => x !== q) : [...p, q])
    }

    const filteredFaqs = FAQS.map(cat => ({
        ...cat,
        items: cat.items.filter(i =>
            i.q.toLowerCase().includes(search.toLowerCase()) ||
            i.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 h-20">
                <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <a href="/" className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all text-slate-400">
                            <ArrowLeft size={20} />
                        </a>
                        <div className="font-black text-xl tracking-tighter">
                            <span className="text-slate-900 dark:text-white uppercase">Milhas</span>
                            <span className="text-amber-500 uppercase"> Pro</span>
                        </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <Button variant="secondary" className="text-[10px] font-black uppercase tracking-widest">Suporte WhatsApp</Button>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-16 animate-fadeIn">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <HelpCircle size={32} className="text-amber-500" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase">
                        Central de <span className="text-amber-500">Ajuda</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
                        Encontre respostas rápidas para gerenciar suas milhas com máxima eficiência.
                    </p>

                    <div className="max-w-2xl mx-auto mt-10 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500" size={20} />
                        <input
                            type="text"
                            placeholder="Qual a sua dúvida hoje?"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 text-lg font-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all uppercase tracking-tight"
                        />
                    </div>
                </div>

                {/* FAQ Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-8 space-y-12">
                        {filteredFaqs.map((cat, ci) => (
                            <section key={ci} className="animate-fadeInUp" style={{ animationDelay: `${ci * 100}ms` }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                                        <cat.icon size={20} />
                                    </div>
                                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{cat.category}</h2>
                                </div>
                                <div className="space-y-4">
                                    {cat.items.map((item, ii) => {
                                        const isOpen = openItems.includes(item.q)
                                        return (
                                            <div key={ii} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-lg transition-all">
                                                <button
                                                    onClick={() => toggle(item.q)}
                                                    className="w-full px-8 py-6 flex items-center justify-between text-left"
                                                >
                                                    <span className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{item.q}</span>
                                                    <ChevronDown className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} size={18} />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-8 pb-8 animate-fadeIn">
                                                        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.a}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        ))}

                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] shadow-sm">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhuma resposta encontrada para "{search}"</p>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                                <HelpCircle size={120} />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest mb-4 relative">Ainda precisa de ajuda?</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-widest mb-8 relative">Nossa equipe está pronta para te atender e tirar qualquer dúvida específica.</p>
                            <Button className="w-full h-14 uppercase font-black text-xs tracking-widest relative group-hover:scale-[1.02] transition-transform">
                                Falar com Especialista
                            </Button>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-[40px] shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Links Úteis</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'MaxMilhas', url: 'https://maxmilhas.com.br' },
                                    { label: 'HotMilhas', url: 'https://hotmilhas.com.br' },
                                    { label: 'Melhores Cartões', url: 'https://melhorescartoes.com.br' },
                                ].map(link => (
                                    <a key={link.label} href={link.url} target="_blank" className="flex items-center justify-between group py-2">
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{link.label}</span>
                                        <ExternalLink size={12} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} Milhas Pro · Gestão de Elite
                    </p>
                </div>
            </footer>
        </div>
    )
}
