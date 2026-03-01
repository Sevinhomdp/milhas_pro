import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PROGRAMS = ["SMILES", "AZUL", "LATAM", "LIVELO", "ESFERA"];

// Headers realistas para evitar bloqueios
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};

Deno.serve(async (req) => {
    try {
        console.log("Iniciando coleta de preços...");

        // Mock de Scraping (Em um ambiente real, faríamos fetch nos sites alvo)
        // Para sites como HotMilhas/MaxMilhas que usam Cloudflare, recomendamos 
        // um serviço de proxy ou API intermediária como ScrapingBee.

        // Simulação de valores baseada no mercado atual (CotaMilhas/Telegram)
        const mockPrices = [
            { programa: "SMILES", valor: 19.64, plataforma: "HOTMILHAS", prazo: "150 dias" },
            { programa: "SMILES", valor: 16.85, plataforma: "MAXMILHAS", prazo: "60 dias" },
            { programa: "AZUL", valor: 17.89, plataforma: "HOTMILHAS", prazo: "150 dias" },
            { programa: "LATAM", valor: 32.47, plataforma: "HOTMILHAS", prazo: "150 dias" },
            { programa: "LIVELO", valor: 35.00, plataforma: "INTERNO", prazo: "Imediato" },
        ];

        const { error } = await supabase
            .from("market_prices")
            .insert(mockPrices.map(p => ({
                programa: p.programa,
                valor: p.valor,
                plataforma: p.plataforma,
                prazo_recebimento: p.prazo,
                timestamp: new Date().toISOString()
            })));

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, count: mockPrices.length }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
