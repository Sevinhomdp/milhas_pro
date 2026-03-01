'use client'

import { Ajuda as AjudaFeature } from '@/src/components/features/Ajuda'
import { useRouteToast } from '@/src/lib/useRouteToast'

export function AjudaRoute() {
  const toast = useRouteToast()
  void toast

  return <AjudaFeature />
}
