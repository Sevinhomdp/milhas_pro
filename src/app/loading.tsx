import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
                <p className="text-[#d4af37] text-sm animate-pulse font-medium tracking-widest uppercase">Carregando Dados...</p>
            </div>
        </div>
    )
}
