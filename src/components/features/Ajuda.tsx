'use client'

import * as React from 'react'
import { HelpCircle, Book, Video, MessageSquare, ExternalLink, ChevronRight, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'

export function Ajuda() {
    const categories = [
        {
            title: 'Primeiros Passos',
            icon: <Zap className="w-5 h-5 text-accent" />,
            items: [
                'Como cadastrar seu primeiro cartão',
                'Entendendo a lógica de CPM e ROI',
                'Como funcionam os saldos híbridos'
            ]
        },
        {
            title: 'Gestão de Operações',
            icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
            items: [
                'Registrando uma transferência com bônus',
                'Como editar ou excluir lançamentos',
                'Controle de faturas e parcelamentos'
            ]
        },
        {
            title: 'Dúvidas Frequentes',
            icon: <MessageSquare className="w-5 h-5 text-green-500" />,
            items: [
                'O que é CPM Alvo?',
                'Como sincronizar dados com o Google',
                'Exportação de dados para Excel/CSV'
            ]
        }
    ]

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-4">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mt-4">Como podemos ajudar?</h1>
                <p className="text-gray-500">Encontre tutoriais e respostas para as principais dúvidas sobre o Milhas Pro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex flex-col items-center text-center space-y-4 border-b-4 border-b-accent">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                        <Book className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Documentação</h3>
                        <p className="text-xs text-gray-500 mt-1">Guia completo com textos e imagens passo a passo.</p>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full">Acessar Guia</Button>
                </div>
                <div className="card p-6 flex flex-col items-center text-center space-y-4 border-b-4 border-b-blue-500">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Vídeo Aulas</h3>
                        <p className="text-xs text-gray-500 mt-1">Aprenda visualmente com nossos tutoriais rápidos.</p>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full">Assistir Agora</Button>
                </div>
                <div className="card p-6 flex flex-col items-center text-center space-y-4 border-b-4 border-b-green-500">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Suporte Direto</h3>
                        <p className="text-xs text-gray-500 mt-1">Fale com nossa equipe pelo WhatsApp ou E-mail.</p>
                    </div>
                    <Button variant="primary" size="sm" className="w-full">Abrir Chat</Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="field-label px-2">Principais Tópicos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="card p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                {cat.icon}
                                <h3 className="font-black text-gray-900 dark:text-white text-sm">{cat.title}</h3>
                            </div>
                            <ul className="space-y-2">
                                {cat.items.map((item, i) => (
                                    <li key={i} className="flex items-center justify-between text-xs text-gray-500 hover:text-accent cursor-pointer group transition-colors">
                                        {item}
                                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card p-8 bg-surfaceDark2 border-accent/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white">Comunidade Milhas Pro</h2>
                        <p className="text-gray-400 text-sm">Troque experiências com outros operadores no nosso grupo VIP.</p>
                    </div>
                    <Button variant="primary" size="lg" icon={<ExternalLink className="w-4 h-4" />}>
                        Entrar no Telegram
                    </Button>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl p-4" />
            </div>
        </div>
    )
}
