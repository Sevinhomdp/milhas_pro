diff --git a/scripts/check-migration.mjs b/scripts/check-migration.mjs
new file mode 100644
index 0000000000000000000000000000000000000000..5d298811c01afb63bd608a3a205b44342d8ca633
--- /dev/null
+++ b/scripts/check-migration.mjs
@@ -0,0 +1,22 @@
+import fs from 'node:fs'
+import path from 'node:path'
+
+const file = path.resolve('supabase/migrations/20260302183000_inteligencia.sql')
+
+if (!fs.existsSync(file)) {
+  console.error('Migration não encontrada:', file)
+  process.exit(1)
+}
+
+const sql = fs.readFileSync(file, 'utf8')
+
+console.log('=== Verificação de Migration ===')
+console.log('Arquivo:', file)
+console.log('Tamanho:', sql.length, 'caracteres')
+console.log('\nPróximo passo (manual):')
+console.log('1. Acesse Supabase → SQL Editor')
+console.log('2. Cole o conteúdo abaixo')
+console.log('3. Execute e valide sem erros')
+console.log('\n--- BEGIN SQL ---\n')
+console.log(sql)
+console.log('\n--- END SQL ---')
