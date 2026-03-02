import fs from 'node:fs'
import path from 'node:path'

const migrationPath = path.resolve('supabase/migrations/20260302183000_inteligencia.sql')

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration não encontrada:', migrationPath)
  process.exit(1)
}

const sql = fs.readFileSync(migrationPath, 'utf8')

console.log('✅ Migration encontrada:')
console.log(migrationPath)
console.log('')
console.log('Próximos passos (manual, por segurança):')
console.log('1) Abrir Supabase → SQL Editor')
console.log('2) Criar nova query')
console.log('3) Colar o conteúdo do arquivo acima')
console.log('4) Executar e validar tabelas/policies criadas')
console.log('')
console.log('Prévia (primeiras 20 linhas):')
console.log(sql.split('\n').slice(0, 20).join('\n'))
