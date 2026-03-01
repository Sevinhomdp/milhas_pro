import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FEEDS = [
    "https://passageirodeprimeira.com/feed/",
    "https://www.melhoresdestinos.com.br/feed",
    "https://pontoseviagens.com/feed/"
];

Deno.serve(async (req) => {
    try {
        console.log("Parsing RSS feeds...");

        // Simplificação: Em produção usaríamos um parser XML (ex: fast-xml-parser)
        // Para o demo, capturamos via fetch e Regex básico de extração de títulos
        const allNews = [];

        for (const url of FEEDS) {
            const res = await fetch(url);
            const xml = await res.text();

            // Regex simples para capturar <title> e <link> dentro de <item>
            const items = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
            for (const item of items) {
                const titleMatch = item[1].match(/<title>(.*?)<\/title>/);
                const linkMatch = item[1].match(/<link>(.*?)<\/link>/);

                if (titleMatch && linkMatch) {
                    allNews.push({
                        titulo: titleMatch[1].replace("<![CDATA[", "").replace("]]>", ""),
                        link: linkMatch[1],
                        data_publicacao: new Date().toISOString()
                    });
                }
            }
        }

        // Classificação via Gemini (se a Key existir)
        for (const news of allNews.slice(0, 5)) { // Processar as 5 mais recentes para o demo
            let category = "OUTROS";
            let score = 5;

            if (GEMINI_API_KEY) {
                try {
                    const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `Classifique a seguinte notícia de milhas no formato JSON: categoria (COMPRA_BONIFICADA, TRANSFERENCIA_BONUS, PROMOCAO_PASSAGEM, OUTROS) e importancia_score (1 a 10). Notícia: "${news.titulo}"`
                                }]
                            }]
                        })
                    });
                    const aiData = await aiRes.json();
                    const responseText = aiData.candidates[0].content.parts[0].text;
                    const parsed = JSON.parse(responseText.match(/\{.*\}/s)[0]);
                    category = parsed.categoria;
                    score = parsed.importancia_score;
                } catch (e) {
                    console.error("Erro na IA:", e);
                }
            }

            await supabase.from("market_news").upsert({
                titulo: news.titulo,
                link: news.link,
                categoria: category,
                importancia_score: score,
                data_publicacao: news.data_publicacao
            }, { onConflict: "link" });
        }

        return new Response(JSON.stringify({ success: true, count: allNews.length }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
