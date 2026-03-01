import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
        const { message } = await req.json()
        const text = message?.text || ''

        if (!text) return new Response('No text', { status: 200 })

        // Padrão esperado do Cota Milhas (Exemplo adaptado)
        // SMILES: R$ 16,80 (90 dias) - Hotmilhas
        // LATAM: R$ 23,50 (150 dias) - Bank

        const programs = ['SMILES', 'LATAM', 'AZUL', 'TAP']
        const platforms = ['HOTMILHAS', 'MAXMILHAS', 'ASAPMILHAS', 'MAISMILHAS', 'BANKMILHAS']

        const results = []

        // Lógica de Regex para extrair múltiplos blocos
        // Busca por: PROGRAMA: R$ VALOR (PRAZO) - PLATAFORMA
        const regex = /([A-Z\s&]+):\s?R\$\s?([\d,.]+)\s?\((.*?)\)\s?-\s?([A-Z\s]+)/gi
        let match

        while ((match = regex.exec(text)) !== null) {
            const [_, prog, val, prazo, plat] = match
            const cleanProg = prog.trim().toUpperCase()
            const cleanPlat = plat.trim().toUpperCase()
            const numericVal = parseFloat(val.replace(',', '.'))

            if (programs.some(p => cleanProg.includes(p)) || cleanProg.includes('MULTI') || cleanProg.includes('MILES')) {
                results.push({
                    programa: cleanProg.includes('SMILES') ? 'SMILES' :
                        cleanProg.includes('LATAM') || cleanProg.includes('MULTI') ? 'LATAM' :
                            cleanProg.includes('AZUL') ? 'AZUL' : 'TAP',
                    plataforma: cleanPlat,
                    prazo_recebimento: prazo,
                    valor_milheiro: numericVal,
                    created_at: new Date().toISOString()
                })
            }
        }

        if (results.length > 0) {
            const { error } = await supabase
                .from('historico_precos')
                .insert(results)

            if (error) throw error
        }

        return new Response(JSON.stringify({ success: true, count: results.length }), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
