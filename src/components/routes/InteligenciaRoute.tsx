diff --git a/src/components/routes/InteligenciaRoute.tsx b/src/components/routes/InteligenciaRoute.tsx
new file mode 100644
index 0000000000000000000000000000000000000000..2aa22985ed2c899962dfc74ff17855a0c30d4d82
--- /dev/null
+++ b/src/components/routes/InteligenciaRoute.tsx
@@ -0,0 +1,11 @@
+'use client'
+
+import InteligenciaFeature from '@/src/components/features/Inteligencia'
+import { useRouteToast } from '@/src/lib/useRouteToast'
+import { Database } from '@/src/types'
+
+export function InteligenciaRoute({ db }: { db: Database }) {
+  const toast = useRouteToast()
+
+  return <InteligenciaFeature db={db} toast={toast} />
+}
