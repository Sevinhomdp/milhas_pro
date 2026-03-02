diff --git a/scripts/verify-clean-source.mjs b/scripts/verify-clean-source.mjs
index fad9f70ef5d172e0d9487526f29015332d63eb51..b28f6921eefbb645896c4af1bdb3127c69743ee1 100644
--- a/scripts/verify-clean-source.mjs
+++ b/scripts/verify-clean-source.mjs
@@ -1,30 +1,31 @@
-import { readFileSync } from 'node:fs'
+import { existsSync, readFileSync } from 'node:fs'
 import { execSync } from 'node:child_process'
 
 const tracked = execSync('git ls-files', { encoding: 'utf8' })
   .split('\n')
   .filter(Boolean)
   .filter((f) => /\.(ts|tsx|js|jsx|json|md|css)$/.test(f))
 
 const problems = []
 
 for (const file of tracked) {
+  if (!existsSync(file)) continue
   const content = readFileSync(file, 'utf8')
   const firstLine = content.split('\n', 1)[0] ?? ''
 
   if (firstLine.startsWith('diff --git ')) {
     problems.push(`${file}: starts with unified diff header`) 
   }
 
   if (content.includes('<<<<<<< ') || content.includes('=======') && content.includes('>>>>>>> ')) {
     problems.push(`${file}: contains unresolved merge conflict markers`)
   }
 }
 
 if (problems.length > 0) {
   console.error('\n❌ Source integrity check failed:\n')
   for (const p of problems) console.error(`- ${p}`)
   process.exit(1)
 }
 
 console.log('✅ Source integrity check passed')
