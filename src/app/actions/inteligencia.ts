'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return { supabase, user }
}

export async function getHistoricoPrecos(program: string, days: number) {
  try {
    const { supabase } = await getAuthenticatedUser()
    const since = new Date()
    since.setDate(since.getDate() - days)
    const { data, error } = await supabase.from('market_prices').select('*').eq('programa', program.toUpperCase()).gte('timestamp', since.toISOString()).order('timestamp', { ascending: true })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getHistoricoPrecos error:', error)
    throw error
  }
}

export async function getProgramaPrecos(program: string) {
  try {
    const { supabase } = await getAuthenticatedUser()
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const { data, error } = await supabase.from('market_prices').select('*').eq('programa', program.toUpperCase()).gte('timestamp', start.toISOString()).order('timestamp', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getProgramaPrecos error:', error)
    throw error
  }
}

export async function getAlertasConfig() {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { data, error } = await supabase.from('alertas_config').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('getAlertasConfig error:', error)
    throw error
  }
}

export async function createAlertaConfig(data: { type: string; threshold_value?: number | null; notification_channel: string; contact_value: string; is_active?: boolean }) {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase.from('alertas_config').insert({ user_id: user.id, type: data.type, threshold_value: data.threshold_value ?? null, notification_channel: data.notification_channel, contact_value: data.contact_value, is_active: data.is_active ?? true })
    if (error) throw error
    revalidatePath('/inteligencia')
    return { success: true }
  } catch (error) {
    console.error('createAlertaConfig error:', error)
    throw error
  }
}

export async function updateAlertaConfig(id: string, data: Record<string, unknown>) {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase.from('alertas_config').update(data).eq('id', id).eq('user_id', user.id)
    if (error) throw error
    revalidatePath('/inteligencia')
    return { success: true }
  } catch (error) {
    console.error('updateAlertaConfig error:', error)
    throw error
  }
}

export async function deleteAlertaConfig(id: string) {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase.from('alertas_config').delete().eq('id', id).eq('user_id', user.id)
    if (error) throw error
    revalidatePath('/inteligencia')
    return { success: true }
  } catch (error) {
    console.error('deleteAlertaConfig error:', error)
    throw error
  }
}
