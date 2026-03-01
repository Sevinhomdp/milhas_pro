<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6fae3fac-85d1-4330-b440-cef3de9e5630

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Checklist interno de PR para `src/app/**`

Ao abrir PR com mudanças no App Router, valide:

- `await cookies()` em todas as chamadas dentro de `src/app/**`.
- `await headers()` em todas as chamadas dentro de `src/app/**`.
- Em novas rotas/páginas dinâmicas (`[id]`, `[slug]`, etc.), usar `params` assíncrono com Promise.

Exemplo recomendado:

```ts
export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  // ...
}
```

Revisão periódica (arquivos novos/alterados):

```bash
npm run review:app-router-async
```
