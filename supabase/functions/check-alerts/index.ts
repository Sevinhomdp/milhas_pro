import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
    try {
        console.log("Iniciando verificação de alertas...");

        // 1. Buscar Alertas Ativos
        const { data: alerts, error: alertErr } = await supabase
            .from("user_alerts")
            .select("*, profiles:user_id(full_name, avatar_url)")
            .eq("status", "ACTIVE");

        if (alertErr) throw alertErr;

        // 2. Buscar Preços Recentes (Últimas 6 horas)
        const { data: prices } = await supabase
            .from("market_prices")
            .select("*")
            .order("timestamp", { ascending: false })
            .limit(20);

        const triggeredAlerts = [];

        // 3. Lógica de cruzamento
        for (const alert of alerts || []) {
            if (alert.tipo_alerta === "CPM_DROP") {
                const matchingPrice = prices?.find(p => p.valor <= alert.trigger_value);
                if (matchingPrice) {
                    triggeredAlerts.push({ alert, reason: `O milheiro da ${matchingPrice.programa} caiu para R$ ${matchingPrice.valor}!` });
                }
            }
        }

        // 4. Envio de Notificações via Resend
        if (RESEND_API_KEY && triggeredAlerts.length > 0) {
            for (const item of triggeredAlerts) {
                // Obter email do auth.users (necessário via admin API no ambiente real)
                // Aqui simulamos o envio
                console.log(`Enviando email para ${item.alert.user_id}: ${item.reason}`);

                await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`
                    },
                    body: JSON.stringify({
                        from: "Milhas Pro <alertas@milhaspro.cloud>",
                        to: ["usuario@exemplo.com"], // Trocar pelo real
                        subject: "MERCADO: Oportunidade Detectada!",
                        html: `<strong>Olá!</strong><p>${item.reason}</p><p><a href="https://milhaspro.cloud/dashboard">Acesse seu dashboard agora</a></p>`
                    })
                });

                // Marcar alerta como TRIGGERED para não repetir
                await supabase
                    .from("user_alerts")
                    .update({ status: "TRIGGERED", ultimo_disparo: new Date().toISOString() })
                    .eq("id", item.alert.id);
            }
        }

        return new Response(JSON.stringify({ success: true, triggered: triggeredAlerts.length }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
