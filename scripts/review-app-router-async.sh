#!/usr/bin/env bash
set -euo pipefail

echo "== Revisão src/app: cookies()/headers()/params =="
echo

echo "1) Ocorrências de cookies( em src/app/**"
rg -n "cookies\\(" src/app || true

echo

echo "2) Ocorrências de headers( em src/app/**"
rg -n "headers\\(" src/app || true

echo

echo "3) Assinaturas com params em src/app/**"
rg -n "params" src/app || true

echo
cat <<'MSG'
Checklist manual sugerido:
- Confirme que chamadas a cookies() e headers() estão com await.
- Em páginas/rotas dinâmicas, prefira assinatura assíncrona para params, por exemplo:
  export default async function Page(
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params
    ...
  }
MSG
