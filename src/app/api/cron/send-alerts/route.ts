diff --git a/src/app/api/cron/send-alerts/route.ts b/src/app/api/cron/send-alerts/route.ts
new file mode 100644
index 0000000000000000000000000000000000000000..cb15b92a9dcea740806d79d21bfd2a51bfc72022
--- /dev/null
+++ b/src/app/api/cron/send-alerts/route.ts
@@ -0,0 +1,89 @@
+import { NextRequest, NextResponse } from 'next/server'
+import { createClient as createSupabaseClient } from '@supabase/supabase-js'
+
+function renderEmailHtml(title: string, message: string, ctaUrl: string) {
+  return `
+  <div style="background:#000;padding:24px;font-family:Arial,sans-serif;color:#fff;">
+    <h1 style="margin:0 0 16px;color:#F5A623;letter-spacing:2px;">MILHAS PRO</h1>
+    <h2 style="margin:0 0 12px;">${title}</h2>
+    <p style="margin:0 0 24px;line-height:1.5;">${message}</p>
+    <a href="${ctaUrl}" style="display:inline-block;background:#F5A623;color:#000;padding:12px 18px;font-weight:700;text-decoration:none;border-radius:8px;">Ver no MilhasPro</a>
+  </div>`
+}
+
+async function sendResendEmail(to: string, subject: string, html: string) {
+  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return
+  await fetch('https://api.resend.com/emails', {
+    method: 'POST',
+    headers: {
+      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
+      'Content-Type': 'application/json',
+    },
+    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [to], subject, html }),
+  })
+}
+
+export async function GET(request: NextRequest) {
+  try {
+    if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
+      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
+    }
+
+    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
+    const { data: alertas, error } = await supabase.from('alertas_config').select('*').eq('is_active', true)
+    if (error) throw error
+
+    const now = new Date()
+    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
+    let triggered = 0
+
+    for (const alerta of alertas || []) {
+      let shouldTrigger = false
+      let message = ''
+
+      if (alerta.type === 'promocao_transferencia') {
+        const { data: news } = await supabase.from('market_news').select('*').eq('type', 'promocao_transferencia').gte('created_at', sixHoursAgo).limit(1)
+        if (news && news.length > 0) {
+          shouldTrigger = true
+          message = `Nova promoção de transferência encontrada: ${news[0].title}`
+        }
+      }
+
+      if (alerta.type === 'preco_acima' || alerta.type === 'preco_abaixo') {
+        const today = new Date(); today.setHours(0, 0, 0, 0)
+        const { data: prices } = await supabase.from('market_prices').select('*').gte('timestamp', today.toISOString())
+        const priceTriggered = (prices || []).some((p: any) => alerta.type === 'preco_acima' ? Number(p.valor) > Number(alerta.threshold_value) : Number(p.valor) < Number(alerta.threshold_value))
+        if (priceTriggered) {
+          shouldTrigger = true
+          message = `Preço de mercado atingiu o limite configurado (${alerta.threshold_value}).`
+        }
+      }
+
+      if (alerta.type === 'fatura_vencimento') {
+        const days = Number(alerta.threshold_value || 0)
+        const target = new Date(); target.setDate(target.getDate() + days)
+        const targetDate = target.toISOString().slice(0, 10)
+        const { data: faturas } = await supabase.from('faturas_parcelas').select('*').eq('user_id', alerta.user_id).eq('pago', false).eq('vencimento', targetDate)
+        if (faturas && faturas.length > 0) {
+          shouldTrigger = true
+          message = `Você possui ${faturas.length} fatura(s) vencendo em ${days} dia(s).`
+        }
+      }
+
+      if (!shouldTrigger) continue
+      triggered += 1
+
+      if (alerta.notification_channel === 'email' && alerta.contact_value) {
+        await sendResendEmail(alerta.contact_value, 'Alerta do Mercado - Milhas Pro', renderEmailHtml('Central de Alertas', message, `${process.env.APP_URL || ''}/inteligencia`))
+      }
+
+      await supabase.from('user_alerts').insert({ user_id: alerta.user_id, tipo_alerta: alerta.type, trigger_value: alerta.threshold_value || 0, status: 'TRIGGERED', last_triggered_at: now.toISOString() })
+      await supabase.from('alertas_config').update({ last_triggered_at: now.toISOString() }).eq('id', alerta.id)
+    }
+
+    return NextResponse.json({ success: true, triggered })
+  } catch (error) {
+    console.error('send-alerts cron error:', error)
+    return NextResponse.json({ success: false, error: 'Failed to send alerts' }, { status: 500 })
+  }
+}
