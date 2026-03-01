'use client'

/**
 * useRouteToast
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook que adapta o ToastContext (signature: toast(type, msg))
 * para a signature esperada pelos Feature Components (signature: toast(msg, type?)).
 *
 * Uso nas route pages server-side que precisam passar toast para features:
 *
 *   // Em um client wrapper dentro da route page:
 *   'use client'
 *   import { useRouteToast } from '@/src/lib/useRouteToast'
 *   import Saldos from '@/src/components/features/Saldos'
 *
 *   export function SaldosRoute({ db }: { db: Database }) {
 *     const toast = useRouteToast()
 *     return <Saldos db={db} toast={toast} theme="dark" />
 *   }
 */

import { useToast } from '@/src/components/ui/Toast'

export type FeatureToastFn = (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void

export function useRouteToast(): FeatureToastFn {
  const { toast } = useToast()
  return (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    toast(type, msg)
  }
}
