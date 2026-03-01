## Resumo
-

## Checklist interno (`src/app/**`)
- [ ] Todos os usos de `cookies()` em `src/app/**` estão com `await`.
- [ ] Todos os usos de `headers()` em `src/app/**` estão com `await`.
- [ ] Toda nova rota/página dinâmica (`[id]`, `[slug]`, etc.) usa assinatura assíncrona compatível com Promise para `params`.
- [ ] Foi feita revisão periódica de arquivos novos/alterados com busca por `cookies(`, `headers(` e `params`.

## Evidências
- Saída de verificação automatizada (`npm run review:app-router-async`):
  - [ ] Incluída no PR.
