'use client'

import SimuladorFeature from '@/src/components/features/Simulador'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import { useRouteToast } from '@/src/lib/useRouteToast'

export function SimuladorRoute() {
  const toast = useRouteToast()
  const { theme } = useTheme()
  void toast

  return <SimuladorFeature theme={theme} />
}
