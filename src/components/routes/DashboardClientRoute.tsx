'use client'

import DashboardClient from '@/src/components/DashboardClient'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { Database } from '@/src/types'
import { User } from '@supabase/supabase-js'

interface DashboardClientRouteProps {
  initialDb: Database
  user: User
}

export function DashboardClientRoute({ initialDb, user }: DashboardClientRouteProps) {
  const toast = useRouteToast()
  void toast

  return <DashboardClient initialDb={initialDb} user={user} />
}
