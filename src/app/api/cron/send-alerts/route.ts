import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function renderEmailHtml(title: string, message: string) {
  return `
  <div style="background:#000;padding:24px;color:#fff;font-family:Arial,sans-serif;">
    <div style="font-size:24px;font-weight:800;color:#F5A623;">MILHAS PRO</div>
    <h1 style="color:#F5A623;">${title}</h1>
    <p>${message}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://milhaspro.app'}/inteligencia" style="display:inline-block;background:#F5A623;color:#000;padding:10px 16px;text-decoration:none;font-weight:700;border-radius:8px;">Ver no MilhasPro</a>
  </div>`
}

async function sendByResend(email: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [email], subject, html }),
  })

  if (!response.ok) {
    throw new Error('Falha ao enviar email')
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: alerts, error } = await supabase.from('alertas_config').select('*').eq('is_active', true)
    if (error) throw error

    let triggers = 0
    const now = new Date()
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const alert of alerts || []) {
      let shouldTrigger = false
      let message = 'Uma condição de mercado foi atendida.'

      if (alert.type === 'promocao_transferencia') {
        const { data } = await supabase
          .from('market_news')
          .select('id,title')
          .eq('type', 'promocao_transferencia')
          .gte('created_at', sixHoursAgo)
          .limit(1)

        shouldTrigger = Boolean(data?.length)
        if (data?.[0]?.title) message = data[0].title
      }

      if (alert.type === 'preco_acima' || alert.type === 'preco_abaixo') {
        const { data } = await supabase
          .from('market_prices')
          .select('valor')
          .gte('timestamp', today.toISOString())

        const values = (data || []).map((row: any) => Number(row.valor))
        shouldTrigger = alert.type === 'preco_acima'
          ? values.some((v) => v > Number(alert.threshold_value || 0))
          : values.some((v) => v < Number(alert.threshold_value || 0))
        message = `Preço de mercado atingiu gatilho ${alert.type}.`
      }

      if (alert.type === 'fatura_vencimento') {
        const days = Number(alert.threshold_value || 0)
        const target = new Date()
        target.setDate(target.getDate() + days)
        const targetMonth = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`
        const { data } = await supabase
          .from('faturas_parcelas')
          .select('id')
          .eq('user_id', alert.user_id)
          .eq('mes_referencia', targetMonth)
          .eq('pago', false)
          .limit(1)

        shouldTrigger = Boolean(data?.length)
        message = `Você possui fatura próxima do vencimento (${days} dias).`
      }

      if (!shouldTrigger || !alert.contact_value) continue

      await sendByResend(alert.contact_value, 'Alerta MilhasPro', renderEmailHtml('Alerta de Mercado', message))
      triggers += 1

      await supabase.from('user_alerts').insert({
        user_id: alert.user_id,
        tipo_alerta: alert.type,
        trigger_value: alert.threshold_value || 0,
        status: 'TRIGGERED',
      })

      await supabase.from('alertas_config').update({ last_triggered_at: now.toISOString() }).eq('id', alert.id)
    }

    return NextResponse.json({ success: true, updated_at: now.toISOString(), records_count: triggers })
  } catch (error) {
    console.error('send-alerts cron error', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
