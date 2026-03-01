'use client'
import Inteligencia from '@/src/components/features/Inteligencia'

export default function InteligenciaPage() {
    const db = {
        profile: null,
        programs: [],
        saldos: [],
        operacoes: [],
        faturas: [],
        cartoes: [],
        metas: []
    }
    return (
        <div className="p-4 md:p-8">
            <Inteligencia db={db as any} toast={() => { }} theme="dark" />
        </div>
    )
}
